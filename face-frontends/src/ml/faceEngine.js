import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

const DETECTOR_STRIDES = [8, 16, 32]
const DEFAULT_SCORE_THRESHOLD = 0.5
const DEFAULT_IOU_THRESHOLD = 0.7
const MAX_IMAGE_SIZE = 640
const ALIGNED_FACE_SIZE = 112
const ARCFACE_LANDMARKS = [
  [38.2946, 51.6963],
  [73.5318, 51.5014],
  [56.0252, 71.7366],
  [41.5493, 92.3655],
  [70.7299, 92.2041],
]

let detectorPromise
let recognizerPromise

function apiUrl(path) {
  return `${(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')}${path}`
}

function loadSession(path) {
  return ort.InferenceSession.create(apiUrl(path), {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  })
}

async function sessions() {
  detectorPromise ||= loadSession('/models/scrfd')
  recognizerPromise ||= loadSession('/models/arcface')
  try {
    return await Promise.all([detectorPromise, recognizerPromise])
  } catch (error) {
    detectorPromise = undefined
    recognizerPromise = undefined
    const wrapped = new Error('ml.modelFailed', { cause: error })
    wrapped.code = 'ml.modelFailed'
    throw wrapped
  }
}

async function decodeImage(dataUrl) {
  const blob = await fetch(dataUrl).then((response) => response.blob())
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' })
    } catch {
      return createImageBitmap(blob)
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

function canvasForImage(image, maximumSize = MAX_IMAGE_SIZE) {
  const longest = Math.max(image.width, image.height)
  const ratio = longest > maximumSize ? maximumSize / longest : 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * ratio))
  canvas.height = Math.max(1, Math.round(image.height * ratio))
  canvas.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0, canvas.width, canvas.height)
  return { canvas, scale: 1 / ratio }
}

function tensorFor(canvas) {
  const { width, height } = canvas
  const pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, width, height).data
  const planeSize = width * height
  const values = new Float32Array(planeSize * 3)

  for (let index = 0; index < planeSize; index += 1) {
    const pixel = index * 4
    values[index] = (pixels[pixel] - 127.5) / 127.5
    values[planeSize + index] = (pixels[pixel + 1] - 127.5) / 127.5
    values[(planeSize * 2) + index] = (pixels[pixel + 2] - 127.5) / 127.5
  }

  return new ort.Tensor('float32', values, [1, 3, height, width])
}

function intersectionOverUnion(left, right) {
  const width = Math.min(left.x + left.w, right.x + right.w) - Math.max(left.x, right.x)
  const height = Math.min(left.y + left.h, right.y + right.h) - Math.max(left.y, right.y)
  if (width <= 0 || height <= 0) return 0
  const overlap = width * height
  return overlap / ((left.w * left.h) + (right.w * right.h) - overlap)
}

function detectFaces(output, width, scale, threshold) {
  const candidates = DETECTOR_STRIDES.flatMap((stride) => {
    const scores = output[`score_${stride}`].data
    const boxes = output[`bbox_${stride}`].data
    const keypoints = output[`kps_${stride}`].data
    const columns = Math.ceil(width / stride)
    const faces = []

    for (let index = 0; index < scores.length; index += 1) {
      if (scores[index] < threshold) continue
      const anchorIndex = Math.floor(index / 2)
      const anchorX = (anchorIndex % columns) * stride
      const anchorY = Math.floor(anchorIndex / columns) * stride
      const boxOffset = index * 4
      const pointOffset = index * 10
      const left = boxes[boxOffset]
      const top = boxes[boxOffset + 1]
      const right = boxes[boxOffset + 2]
      const bottom = boxes[boxOffset + 3]
      const points = Array.from({ length: 5 }, (_, pointIndex) => [
        (anchorX + (keypoints[pointOffset + (pointIndex * 2)] * stride)) * scale,
        (anchorY + (keypoints[pointOffset + (pointIndex * 2) + 1] * stride)) * scale,
      ])
      faces.push({
        score: scores[index],
        location: {
          x: (anchorX - (left * stride)) * scale,
          y: (anchorY - (top * stride)) * scale,
          w: (left + right) * stride * scale,
          h: (top + bottom) * stride * scale,
        },
        points,
      })
    }
    return faces
  }).sort((left, right) => right.score - left.score)

  return candidates.reduce((selected, candidate) => {
    if (selected.every((face) => intersectionOverUnion(face.location, candidate.location) < DEFAULT_IOU_THRESHOLD)) selected.push(candidate)
    return selected
  }, [])
}

function solveLinearSystem(matrix, values) {
  const augmented = matrix.map((row, index) => [...row, values[index]])
  for (let column = 0; column < augmented.length; column += 1) {
    let pivot = column
    for (let row = column + 1; row < augmented.length; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row
    }
    ;[augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]]
    if (Math.abs(augmented[column][column]) < 1e-10) throw new Error('Singular transform')
    const divisor = augmented[column][column]
    for (let index = column; index <= augmented.length; index += 1) augmented[column][index] /= divisor
    for (let row = 0; row < augmented.length; row += 1) {
      if (row === column) continue
      const factor = augmented[row][column]
      for (let index = column; index <= augmented.length; index += 1) augmented[row][index] -= factor * augmented[column][index]
    }
  }
  return augmented.map((row) => row.at(-1))
}

function similarityTransform(sourcePoints) {
  const rows = []
  const values = []
  sourcePoints.forEach(([sourceX, sourceY], index) => {
    const [targetX, targetY] = ARCFACE_LANDMARKS[index]
    rows.push([sourceX, -sourceY, 1, 0], [sourceY, sourceX, 0, 1])
    values.push(targetX, targetY)
  })
  const normal = Array.from({ length: 4 }, () => Array(4).fill(0))
  const projected = Array(4).fill(0)
  rows.forEach((row, rowIndex) => {
    for (let left = 0; left < 4; left += 1) {
      projected[left] += row[left] * values[rowIndex]
      for (let right = 0; right < 4; right += 1) normal[left][right] += row[left] * row[right]
    }
  })
  return solveLinearSystem(normal, projected)
}

function cropFace(image, location) {
  const paddingX = location.w * 0.25
  const paddingY = location.h * 0.25
  const left = Math.max(0, location.x - paddingX)
  const top = Math.max(0, location.y - paddingY)
  const right = Math.min(image.width, location.x + location.w + paddingX)
  const bottom = Math.min(image.height, location.y + location.h + paddingY)
  const canvas = document.createElement('canvas')
  canvas.width = ALIGNED_FACE_SIZE
  canvas.height = ALIGNED_FACE_SIZE
  canvas.getContext('2d').drawImage(image, left, top, Math.max(1, right - left), Math.max(1, bottom - top), 0, 0, ALIGNED_FACE_SIZE, ALIGNED_FACE_SIZE)
  return canvas
}

function alignFace(image, face) {
  try {
    const [scaleCos, scaleSin, translateX, translateY] = similarityTransform(face.points)
    const canvas = document.createElement('canvas')
    canvas.width = ALIGNED_FACE_SIZE
    canvas.height = ALIGNED_FACE_SIZE
    const context = canvas.getContext('2d')
    context.setTransform(scaleCos, scaleSin, -scaleSin, scaleCos, translateX, translateY)
    context.drawImage(image, 0, 0)
    return canvas
  } catch {
    return cropFace(image, face.location)
  }
}

function normalize(values) {
  const vector = Array.from(values, Number)
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + (value * value), 0))
  return norm ? vector.map((value) => value / norm) : vector
}

async function recognize(recognizer, image, face) {
  const aligned = alignFace(image, face)
  const output = await recognizer.run({ [recognizer.inputNames[0]]: tensorFor(aligned) })
  const embedding = normalize(output[recognizer.outputNames[0]].data)
  return {
    faceScore: Math.floor(face.score * 1_000_000) / 10_000,
    location: Object.fromEntries(Object.entries(face.location).map(([key, value]) => [key, Math.round(value)])),
    embedding,
    faceImageBase64: aligned.toDataURL('image/jpeg', 0.9),
  }
}

export async function extractFaces(imageDataUrl, { scoreThreshold = 0, limit = 5 } = {}) {
  const [detector, recognizer] = await sessions()
  const image = await decodeImage(imageDataUrl)
  try {
    const { canvas, scale } = canvasForImage(image)
    const output = await detector.run({ [detector.inputNames[0]]: tensorFor(canvas) })
    const threshold = Number(scoreThreshold) > 0 ? Number(scoreThreshold) / 100 : DEFAULT_SCORE_THRESHOLD
    const faces = detectFaces(output, canvas.width, scale, threshold).slice(0, Math.max(1, Number(limit) || 1))
    return await Promise.all(faces.map((face) => recognize(recognizer, image, face)))
  } finally {
    image.close?.()
  }
}

function cosine(left, right) {
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index]
    leftMagnitude += left[index] ** 2
    rightMagnitude += right[index] ** 2
  }
  const magnitude = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)
  return magnitude ? dot / magnitude : 0
}

function enhance(value) {
  if (value >= 0.5) return value + (2 * (value - 0.5) * (1 - value))
  if (value >= 0) return value - (2 * (value - 0.5) * -value)
  return value
}

function floor(value, digits) {
  const scale = 10 ** digits
  return Math.floor(value * scale) / scale
}

export function compareEmbeddings(left, right, needFaceInfo = true) {
  const result = {
    confidence: floor(enhance(cosine(left.embedding, right.embedding)) * 100, 4),
    distance: floor(Math.sqrt(left.embedding.reduce((sum, value, index) => sum + ((value - right.embedding[index]) ** 2), 0)), 4),
  }
  if (needFaceInfo) {
    result.faceInfo = {
      faceScoreA: left.faceScore,
      faceScoreB: right.faceScore,
      locationA: left.location,
      locationB: right.location,
    }
  }
  return result
}
