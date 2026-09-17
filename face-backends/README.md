# FaceRail Backend

Rails API rewrite of the behavior documented by the ignored `../face-search`
reference project. The existing Vue app in `../face-frontends` uses the
compatible `/api/visual/...` endpoints.

## Architecture

```text
Upload image
  -> Active Storage
  -> Solid Queue (embeddings)
  -> ruby-vips preprocessing
  -> SCRFD face detection (ONNX Runtime)
  -> ArcFace 512-dimensional embedding (ONNX Runtime)
  -> PostgreSQL + pgvector

Query image
  -> SCRFD + ArcFace
  -> pgvector cosine nearest-neighbor search
  -> top 20 faces by default
```

Solid Queue uses the same PostgreSQL database as the application. Face images
are stored through Active Storage; model weights remain external runtime files.

## Requirements

- Ruby 4.0.5
- PostgreSQL 17 with pgvector
- ONNX Runtime (provided by the `onnxruntime` gem)
- libvips / ruby-vips

## Setup

```sh
brew install postgresql@17 pgvector vips
brew services start postgresql@17

bundle config set --local path vendor/bundle
bundle install
bin/rails db:prepare
bin/rails face_models:install
```

`face_models:install` copies the SCRFD detector and ArcFace recognizer from the
ignored `../face-search` reference checkout into `storage/models`. Model files
and local gems are intentionally excluded from Git.

Port 8080 matches the development proxy configured in
`../face-frontends/vite.config.js`.

Run the API and embedding worker in separate terminals:

```sh
bin/rails server -p 8080
bin/jobs
```

## Docker

The repository-level `Dockerfile` builds only the Rails backend. Run the build
from the repository root so Docker can use `face-backends` as its source:

```sh
docker build -t facerail-backend -f Dockerfile .
```

Set `DATABASE_URL` to a PostgreSQL database with the vector extension available.
Run a second container with `./bin/jobs` for embeddings, and mount the ONNX model
files under `/rails/storage/models` or set explicit model paths.

For another model location, set:

```sh
FACE_DETECTION_MODEL_PATH=/path/to/scrfd.onnx
FACE_RECOGNITION_MODEL_PATH=/path/to/arcface.onnx
```

The same image runs the Solid Queue worker by replacing the default command:

```sh
docker run --rm facerail-backend ./bin/jobs
```

For the complete PostgreSQL, API, worker and frontend topology, use the
repository-level `compose.yml` and follow [`../README.md`](../README.md).

## API

Face creation returns a record in `pending` state and Solid Queue finishes the
embedding asynchronously. Searches only include `ready` records and use a
pgvector HNSW cosine index. The backend implements collection, sample and face
lifecycle operations plus M:N search and 1:1 comparison. Both path forms are
supported:

- `/visual/...`
- `/api/visual/...`

Responses retain the original `{ code, message, data }` contract. Business
errors return `code: 1` so the existing Axios interceptor can display them.

The Vue client can also run SCRFD and ArcFace on-device. In that mode the API
serves models from `/api/models/scrfd` and `/api/models/arcface`, accepts query
embeddings at `/api/visual/search/embedding`, and accepts enrolled embeddings at
`/api/visual/face/create_embedding`. The original cloud inference endpoints
remain unchanged and fully supported.

## Verification

```sh
bin/rails test
bin/rails zeitwerk:check
bin/rubocop
bin/brakeman --no-pager
```
