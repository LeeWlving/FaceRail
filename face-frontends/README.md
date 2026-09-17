# FaceRail Frontend

FaceRail 的 Vue 3 管理控制台，用于集合、样本和人脸数据管理，以及 M:N 人脸搜索和 1:1 人脸比对。生产环境由 Nginx 提供静态文件，并将 `/api` 代理到 Rails。

![人脸搜索界面](docs/search-desktop.png)

## 技术栈

- Vue 3
- Vite
- Vue Router
- Element Plus
- Axios
- Lucide Icons
- Playwright

## 本地开发

需要 Node.js 20.19 或更高版本。默认通过 Vite 将 `/api` 代理到 `http://127.0.0.1:8080`。

```bash
npm install
npm run dev
```

自定义后端地址时，可通过环境变量覆盖 API 根路径：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080 npm run dev
```

主要路由：

| 路径 | 功能 |
| --- | --- |
| `/search` | M:N 人脸搜索 |
| `/compare` | 1:1 人脸比对 |
| `/collections` | 集合管理 |
| `/samples` | 样本与 embedding 状态管理 |
| `/faces/create` | 异步录入人脸 |

## 检查与构建

```bash
npm run lint
npm run build
npm run test:visual
```

视觉检查默认使用 macOS 中的 Google Chrome，可通过 `CHROME_PATH` 指定其他 Chromium 可执行文件。

## Docker

从仓库根目录构建：

```bash
docker build -t facerail-frontend -f face-frontends/Dockerfile face-frontends
docker run --rm -p 8081:80 -e BACKEND_URL=http://host.docker.internal:8080 facerail-frontend
```

完整接口契约见 [`docs/2.1.0.md`](docs/2.1.0.md)，完整部署说明见仓库根目录 [`README.md`](../README.md)。
