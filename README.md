# FaceRail

[![CI](https://github.com/LeeWlving/FaceRail/actions/workflows/ci.yml/badge.svg)](https://github.com/LeeWlving/FaceRail/actions/workflows/ci.yml)

FaceRail 是一个可自行部署的人脸数据管理与向量检索系统。它使用 Rails 提供兼容 Face Search 2.1 的 API，通过 SCRFD 检测人脸、ArcFace 生成 512 维特征向量，并由 PostgreSQL 与 pgvector 完成余弦相似度搜索。Vue 3 控制台提供集合、样本、人脸录入、M:N 搜索和 1:1 比对界面。

![FaceRail 人脸搜索界面](face-frontends/docs/search-desktop.png)

## 核心能力

- 管理命名空间、集合、自定义样本字段和人脸字段
- 创建、更新和删除身份样本
- 上传图片并异步生成人脸 embedding
- 在单张查询图中检测多张人脸
- 使用 pgvector 返回默认 Top 20 相似人脸
- 对两张图片执行 1:1 人脸比对
- 查看 embedding 的等待、处理中、可搜索和失败状态
- 使用 Active Storage 管理原图与人脸裁剪图

## 系统架构

```text
Browser
  |
  v
Vue 3 + Vite + Nginx
  |
  v
Ruby on Rails API
  |--------------------------|
  v                          v
Active Storage                Solid Queue worker
  |                                  |
  v                                  v
Cloudflare R2                ruby-vips preprocessing
                             |
                             v
                       SCRFD detection
                             |
                             v
                      ArcFace embedding
                             |
                             v
                  PostgreSQL 17 + pgvector

Query image -> SCRFD -> ArcFace -> cosine similarity -> Top 20 faces
```

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3、Vite、Vue Router、Element Plus、Axios |
| API | Ruby 4、Rails 8 API mode |
| 数据库 | PostgreSQL 17、pgvector、HNSW cosine index |
| 图片 | Active Storage、Cloudflare R2、ruby-vips |
| 推理 | ONNX Runtime、SCRFD、ArcFace |
| 异步任务 | Active Job、Solid Queue |
| 发布 | Docker、Nginx、GitHub Actions、GHCR |

## 目录结构

```text
FaceRail/
├── face-backends/          Rails API、模型推理和后台任务
├── face-frontends/         Vue 3 管理控制台
├── .github/workflows/      CI 与 GHCR 镜像发布
├── compose.yml             完整生产拓扑
├── Dockerfile              后端镜像
└── .env.example            Compose 环境变量示例
```

`face-search/` 仅作为本地参考实现使用，已被 Git 忽略，不属于发布产物。

## 本地开发

### 环境要求

- Ruby 4.0.5
- Node.js 20.19 或更高版本
- PostgreSQL 17 与 pgvector
- libvips
- 两个 ONNX 模型文件

macOS 可以通过 Homebrew 安装系统依赖：

```bash
brew install postgresql@17 pgvector vips
brew services start postgresql@17
```

### 准备模型

将模型放到 `face-backends/storage/models/`：

```text
scrfd_500m_bnkps.onnx
glint360k_cosface_r18_fp16_0.1.onnx
```

如果本机同时保留了原始 `face-search` 项目，可以直接复制：

```bash
cd face-backends
bin/rails face_models:install
```

也可以通过以下环境变量使用其他位置：

```bash
FACE_DETECTION_MODEL_PATH=/path/to/scrfd.onnx
FACE_RECOGNITION_MODEL_PATH=/path/to/arcface.onnx
```

### 启动后端

```bash
cd face-backends
bundle config set --local path vendor/bundle
bundle install
bin/rails db:prepare
bin/rails server -p 8080
```

另开一个终端启动 embedding worker：

```bash
cd face-backends
bin/jobs
```

### 启动前端

```bash
cd face-frontends
npm ci
npm run dev
```

开发地址：

- 前端：`http://127.0.0.1:5173`
- Rails API：`http://127.0.0.1:8080`
- 健康检查：`http://127.0.0.1:8080/up`

Vite 会将 `/api` 请求代理到本地 Rails 服务。通过 `VITE_API_BASE_URL` 可以覆盖 API 根路径。

## API

所有响应都使用兼容格式：

```json
{
  "code": 0,
  "message": "",
  "data": {}
}
```

主要接口：

| 功能 | 方法 | 路径 |
| --- | --- | --- |
| 集合管理 | GET/POST | `/api/visual/collect/*` |
| 样本管理 | GET/POST | `/api/visual/sample/*` |
| 人脸管理 | GET/POST | `/api/visual/face/*` |
| M:N 搜索 | POST | `/api/visual/search/do` |
| 1:1 比对 | POST | `/api/visual/compare/do` |

完整接口契约见 [`face-frontends/docs/2.1.0.md`](face-frontends/docs/2.1.0.md)。服务同时保留不带 `/api` 前缀的 `/visual/...` 兼容路径。

## 图片存储：Active Storage 与 Cloudflare R2

FaceRail 使用 Active Storage 管理上传的原图和检测后的人脸裁剪图。存储后端按运行环境区分：

| 环境 | Active Storage service | 数据位置 |
| --- | --- | --- |
| development | `local` | `face-backends/storage/` |
| test | `test` | 临时目录，测试结束后可丢弃 |
| production | `r2`（默认） | Cloudflare R2 |

当集合的“保留人脸图片”关闭时，embedding 生成成功后会清理上传的原图，也不会保留人脸裁剪图；开启时，两类图片都会由 Active Storage 保存到当前 service。

### 创建 R2 存储

1. 在 Cloudflare R2 中创建一个存储桶，例如 `facerail`。人脸图片属于敏感数据，建议保持存储桶私有。
2. 创建仅限该存储桶的 R2 API Token，并授予对象读取和写入权限。
3. 保存生成的 Access Key ID 和 Secret Access Key。Secret 只会显示一次。
4. 使用账户级 S3 API 地址作为 endpoint，格式为 `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`。不要填写公开域名，也不要在末尾追加存储桶名称。

FaceRail 的图片由 Rails API 和 Solid Queue worker 在服务端读写，不由浏览器直传，因此不需要为存储桶开启公开访问或配置浏览器 CORS。

### 配置参数

将以下参数写入项目根目录的 `.env`：

```dotenv
ACTIVE_STORAGE_SERVICE=r2
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET=facerail
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `ACTIVE_STORAGE_SERVICE` | 是 | 生产环境使用 `r2`；Rails 会据此选择 `config/storage.yml` 中的 service |
| `R2_ACCESS_KEY_ID` | 是 | R2 API Token 生成的 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | 是 | R2 API Token 生成的 Secret Access Key |
| `R2_BUCKET` | 是 | R2 存储桶名称 |
| `R2_ENDPOINT` | 是 | 账户级 R2 S3 API endpoint |

`compose.yml` 会把同一组参数同时传给 backend 和 worker。修改 `.env` 后使用以下命令重新创建服务：

```bash
docker compose up -d --force-recreate backend worker
```

### 验证 R2

先确认 Rails 已选择 S3 service：

```bash
docker compose exec backend bin/rails runner \
  'puts "#{ActiveStorage::Blob.service.name}: #{ActiveStorage::Blob.service.class.name}"'
```

预期输出包含 `r2: ActiveStorage::Service::S3Service`。还可以创建一个临时对象，验证写入、读取和删除链路：

```bash
docker compose exec backend bin/rails runner \
  'blob = ActiveStorage::Blob.create_and_upload!(io: StringIO.new("FaceRail R2 check"), filename: "r2-check.txt", content_type: "text/plain"); puts blob.service.exist?(blob.key); blob.purge'
```

预期输出 `true`，测试对象随后会被删除。若出现 `AccessDenied`，检查 Token 的存储桶范围和对象读写权限；若出现连接或签名错误，检查 endpoint 是否为账户级 S3 API 地址，以及容器时间是否准确。

开发环境默认使用 `local`，无需配置 R2。生产 Docker 拓扑没有为本地 Active Storage 配置持久卷，因此不要在正式部署中把 `ACTIVE_STORAGE_SERVICE` 改为 `local`，否则重建容器后图片会丢失。

## Docker 部署

GitHub Actions 会发布两张 `linux/amd64` 镜像：

- `ghcr.io/leewlving/facerail-backend:latest`
- `ghcr.io/leewlving/facerail-frontend:latest`

准备部署配置和模型：

```bash
cp .env.example .env
mkdir -p models
cp /path/to/scrfd_500m_bnkps.onnx models/
cp /path/to/glint360k_cosface_r18_fp16_0.1.onnx models/
```

在 `.env` 中设置强密码及 Rails 密钥。Rails 密钥可以这样生成：

```bash
cd face-backends
bin/rails secret
```

启动 PostgreSQL、API、worker 和前端：

```bash
docker compose pull
docker compose up -d
docker compose ps
```

默认入口为 `http://localhost`，API 也会映射到 `http://localhost:8080`。上传文件通过 Active Storage 保存到 Cloudflare R2，PostgreSQL 数据保存在命名卷中，模型以只读方式挂载。R2 的完整准备、配置和验证方法见“图片存储：Active Storage 与 Cloudflare R2”。

如 GHCR 包尚未设置为公开，需要先使用具有 `read:packages` 权限的令牌登录：

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
```

### 本地构建镜像

```bash
docker build -t facerail-backend -f Dockerfile .
docker build -t facerail-frontend -f face-frontends/Dockerfile face-frontends
```

## CI/CD

每次提交到 `main` 都会依次执行：

1. Brakeman 与 Bundler Audit 安全扫描
2. RuboCop 后端代码检查
3. PostgreSQL + pgvector 集成测试
4. 前端 i18n 单元测试、ESLint 与 Vite 生产构建
5. 所有检查通过后构建并推送 backend/frontend 镜像到 GHCR

镜像同时带有 `latest` 和 `sha-<commit>` 标签，并生成 provenance 与 SBOM。Pull Request 只运行检查，不发布镜像。

## 本地验证

后端：

```bash
cd face-backends
bin/rails test
bin/rails zeitwerk:check
bin/rubocop
bin/brakeman --no-pager
```

前端：

```bash
cd face-frontends
npm run test:unit
npm run lint
npm run build
npm run test:visual
```
