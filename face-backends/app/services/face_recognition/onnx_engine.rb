require "base64"
require "matrix"
require "onnxruntime"
require "vips"

module FaceRecognition
  class OnnxEngine
    DETECTOR_STRIDES = [8, 16, 32].freeze
    DEFAULT_SCORE_THRESHOLD = 0.5
    DEFAULT_IOU_THRESHOLD = 0.7
    MAX_IMAGE_SIZE = 640
    ALIGNED_FACE_SIZE = 112
    ARCFACE_LANDMARKS = [
      [38.2946, 51.6963],
      [73.5318, 51.5014],
      [56.0252, 71.7366],
      [41.5493, 92.3655],
      [70.7299, 92.2041]
    ].freeze

    def initialize(
      detector_path: ENV.fetch("FACE_DETECTION_MODEL_PATH", Rails.root.join("storage/models/scrfd_500m_bnkps.onnx").to_s),
      recognizer_path: ENV.fetch("FACE_RECOGNITION_MODEL_PATH", Rails.root.join("storage/models/glint360k_cosface_r18_fp16_0.1.onnx").to_s)
    )
      @detector_path = detector_path
      @recognizer_path = recognizer_path
    end

    def extract(image_base64, score_threshold: 0, limit: 5)
      image = decode_image(image_base64)
      prepared, scale = prepare_detection_image(image)
      output = detector.predict({ detector_input_name => tensor_for(prepared) })
      threshold = score_threshold.to_f.positive? ? score_threshold.to_f / 100.0 : DEFAULT_SCORE_THRESHOLD

      detect_faces(output, prepared.width, scale, threshold)
        .first([limit.to_i, 1].max)
        .map { |face| recognize(image, face) }
    rescue Vips::Error, ArgumentError => e
      raise FaceSearch::Error, "invalid image: #{e.message}"
    end

    private

    def detector
      @detector ||= load_model(@detector_path, "FACE_DETECTION_MODEL_PATH")
    end

    def recognizer
      @recognizer ||= load_model(@recognizer_path, "FACE_RECOGNITION_MODEL_PATH")
    end

    def detector_input_name
      detector.inputs.first.fetch(:name)
    end

    def recognizer_input_name
      recognizer.inputs.first.fetch(:name)
    end

    def load_model(path, environment_key)
      unless File.file?(path)
        raise FaceSearch::Error, "model file not found; set #{environment_key} (expected #{path})"
      end

      OnnxRuntime::Model.new(path, intra_op_num_threads: ENV.fetch("ONNX_THREADS", 2).to_i)
    end

    def decode_image(value)
      encoded = value.to_s.sub(/\Adata:image\/[^;]+;base64,/, "")
      bytes = Base64.strict_decode64(encoded)
      image = Vips::Image.new_from_buffer(bytes, "").autorot
      image = image.flatten(background: [255, 255, 255]) if image.has_alpha?
      image = image.colourspace("srgb")
      image.bands > 3 ? image.extract_band(0, n: 3) : image
    end

    def prepare_detection_image(image)
      longest = [image.width, image.height].max
      return [image, 1.0] if longest <= MAX_IMAGE_SIZE

      ratio = MAX_IMAGE_SIZE.to_f / longest
      [image.resize(ratio), 1.0 / ratio]
    end

    def tensor_for(image)
      pixels = image.cast("uchar").write_to_memory.unpack("C*")
      planes = Array.new(3) { Array.new(image.height) { Array.new(image.width) } }

      image.height.times do |y|
        image.width.times do |x|
          offset = ((y * image.width) + x) * 3
          3.times { |channel| planes[channel][y][x] = (pixels[offset + channel] - 127.5) / 127.5 }
        end
      end

      [planes]
    end

    def detect_faces(output, image_width, scale, threshold)
      candidates = DETECTOR_STRIDES.each_with_index.flat_map do |stride, index|
        scores = output.fetch("score_#{stride}")
        boxes = output.fetch("bbox_#{stride}")
        keypoints = output.fetch("kps_#{stride}")
        columns = (image_width.to_f / stride).ceil

        scores.each_index.filter_map do |i|
          next if scores[i][0] < threshold

          anchor_index = i / 2
          anchor_x = (anchor_index % columns) * stride
          anchor_y = (anchor_index / columns) * stride
          box = boxes[i]
          location = {
            x: (anchor_x - (box[0] * stride)) * scale,
            y: (anchor_y - (box[1] * stride)) * scale,
            w: (box[0] + box[2]) * stride * scale,
            h: (box[1] + box[3]) * stride * scale
          }
          points = keypoints[i].each_slice(2).map do |px, py|
            [(anchor_x + (px * stride)) * scale, (anchor_y + (py * stride)) * scale]
          end
          { score: scores[i][0], location: location, points: points }
        end
      end

      non_maximum_suppression(candidates.sort_by { |candidate| -candidate[:score] })
    end

    def non_maximum_suppression(candidates)
      selected = []
      candidates.each do |candidate|
        selected << candidate if selected.none? { |face| intersection_over_union(face[:location], candidate[:location]) >= DEFAULT_IOU_THRESHOLD }
      end
      selected
    end

    def intersection_over_union(left, right)
      x_overlap = [left[:x] + left[:w], right[:x] + right[:w]].min - [left[:x], right[:x]].max
      y_overlap = [left[:y] + left[:h], right[:y] + right[:h]].min - [left[:y], right[:y]].max
      return 0.0 if x_overlap <= 0 || y_overlap <= 0

      overlap = x_overlap * y_overlap
      overlap / ((left[:w] * left[:h]) + (right[:w] * right[:h]) - overlap)
    end

    def recognize(image, face)
      aligned = align_face(image, face)
      output = recognizer.predict({ recognizer_input_name => tensor_for(aligned) })
      vector = output.values.first.first.map(&:to_f)
      norm = Math.sqrt(vector.sum { |value| value**2 })
      vector.map! { |value| value / norm } unless norm.zero?

      Result.new(
        score: (face[:score] * 100).floor(4),
        location: face[:location].transform_values { |value| value.round },
        embedding: vector,
        face_image: Base64.strict_encode64(aligned.write_to_buffer(".jpg"))
      )
    end

    def align_face(image, face)
      transform = similarity_transform(face[:points], ARCFACE_LANDMARKS)
      source = image.cast("uchar")
      source_pixels = source.write_to_memory.unpack("C*")
      output_pixels = Array.new(ALIGNED_FACE_SIZE * ALIGNED_FACE_SIZE * 3, 0)

      ALIGNED_FACE_SIZE.times do |target_y|
        ALIGNED_FACE_SIZE.times do |target_x|
          source_x, source_y = inverse_transform(target_x, target_y, transform)
          write_sample(output_pixels, target_x, target_y, source_pixels, source, source_x, source_y)
        end
      end

      Vips::Image.new_from_memory(output_pixels.pack("C*"), ALIGNED_FACE_SIZE, ALIGNED_FACE_SIZE, 3, :uchar)
    rescue StandardError
      crop_face(image, face[:location]).thumbnail_image(
        ALIGNED_FACE_SIZE, height: ALIGNED_FACE_SIZE, size: :force
      )
    end

    def similarity_transform(source_points, target_points)
      rows = []
      values = []
      source_points.zip(target_points).each do |(source_x, source_y), (target_x, target_y)|
        rows << [source_x, -source_y, 1.0, 0.0]
        rows << [source_y, source_x, 0.0, 1.0]
        values << target_x << target_y
      end

      matrix = Matrix.rows(rows)
      solution = (matrix.transpose * matrix).inverse * matrix.transpose * Vector.elements(values)
      solution.to_a
    end

    def inverse_transform(target_x, target_y, transform)
      scale_cos, scale_sin, translate_x, translate_y = transform
      determinant = (scale_cos**2) + (scale_sin**2)
      x = target_x - translate_x
      y = target_y - translate_y
      [
        ((scale_cos * x) + (scale_sin * y)) / determinant,
        ((-scale_sin * x) + (scale_cos * y)) / determinant
      ]
    end

    def write_sample(output, target_x, target_y, source, image, source_x, source_y)
      return if source_x.negative? || source_y.negative? || source_x >= image.width - 1 || source_y >= image.height - 1

      x0 = source_x.floor
      y0 = source_y.floor
      x_weight = source_x - x0
      y_weight = source_y - y0
      target_offset = ((target_y * ALIGNED_FACE_SIZE) + target_x) * 3

      3.times do |channel|
        top_left = source[((y0 * image.width) + x0) * 3 + channel]
        top_right = source[((y0 * image.width) + x0 + 1) * 3 + channel]
        bottom_left = source[(((y0 + 1) * image.width) + x0) * 3 + channel]
        bottom_right = source[(((y0 + 1) * image.width) + x0 + 1) * 3 + channel]
        top = top_left + ((top_right - top_left) * x_weight)
        bottom = bottom_left + ((bottom_right - bottom_left) * x_weight)
        output[target_offset + channel] = (top + ((bottom - top) * y_weight)).round.clamp(0, 255)
      end
    end

    def crop_face(image, location)
      padding_x = location[:w] * 0.25
      padding_y = location[:h] * 0.25
      left = [location[:x] - padding_x, 0].max.floor
      top = [location[:y] - padding_y, 0].max.floor
      right = [location[:x] + location[:w] + padding_x, image.width].min.ceil
      bottom = [location[:y] + location[:h] + padding_y, image.height].min.ceil
      image.crop(left, top, [right - left, 1].max, [bottom - top, 1].max)
    end
  end
end
