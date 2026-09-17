# FaceRail backend

Ruby on Rails rewrite of the backend behavior documented by the local
`face-search` reference project. The Vue application in `../face-frontends`
continues to use the compatible `/api/visual/...` endpoints.

## Requirements

- Ruby 4.0.5
- SQLite 3
- ONNX Runtime (provided by the `onnxruntime` gem)
- libvips (`brew install vips` on macOS)

## Setup

```sh
bundle config set --local path vendor/bundle
bundle install
bin/rails db:prepare
bin/rails face_models:install
bin/rails server -p 8080
```

`face_models:install` copies the SCRFD detector and ArcFace recognizer from the
ignored `../face-search` reference checkout into `storage/models`. Model files
and local gems are intentionally excluded from Git.

Port 8080 matches the development proxy configured in
`../face-frontends/vue.config.js`.

For another model location, set:

```sh
FACE_DETECTION_MODEL_PATH=/path/to/scrfd.onnx
FACE_RECOGNITION_MODEL_PATH=/path/to/arcface.onnx
```

## API

The backend implements collection, sample and face lifecycle operations plus
M:N search and 1:1 comparison. Both the original paths and the frontend proxy
paths are supported:

- `/visual/...`
- `/api/visual/...`

Responses retain the original `{ code, message, data }` contract. Business
errors return `code: 1` so the existing Axios interceptor can display them.

## Verification

```sh
bin/rails test
bin/rails zeitwerk:check
bin/rubocop
bin/brakeman --no-pager
```
