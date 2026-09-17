module Api
  class ModelsController < BaseController
    MODELS = {
      "scrfd" => ["FACE_DETECTION_MODEL_PATH", "scrfd_500m_bnkps.onnx"],
      "arcface" => ["FACE_RECOGNITION_MODEL_PATH", "glint360k_cosface_r18_fp16_0.1.onnx"]
    }.freeze

    def show
      environment_key, filename = MODELS.fetch(params[:id])
      path = Pathname.new(ENV.fetch(environment_key, Rails.root.join("storage/models", filename).to_s))
      raise FaceSearch::Error, "model file not found; set #{environment_key}" unless path.file?

      expires_in 1.day, public: true
      send_file path, filename:, type: "application/octet-stream", disposition: "inline"
    end
  end
end
