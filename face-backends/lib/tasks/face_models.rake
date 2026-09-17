namespace :face_models do
  desc "Copy the SCRFD and ArcFace models from the local face-search reference"
  task install: :environment do
    require "fileutils"

    reference = Pathname.new(ENV.fetch("FACE_SEARCH_REFERENCE_PATH", Rails.root.join("../face-search"))).expand_path
    models = {
      reference.join("face-search-core/src/main/resources/model/onnx/detection_face_scrfd/scrfd_500m_bnkps.onnx") =>
        Rails.root.join("storage/models/scrfd_500m_bnkps.onnx"),
      reference.join("face-search-core/src/main/resources/model/onnx/recognition_face_arc/glint360k_cosface_r18_fp16_0.1.onnx") =>
        Rails.root.join("storage/models/glint360k_cosface_r18_fp16_0.1.onnx")
    }

    missing = models.keys.reject(&:file?)
    abort "Missing source models: #{missing.join(", ")}" if missing.any?

    FileUtils.mkdir_p(Rails.root.join("storage/models"))
    models.each do |source, destination|
      FileUtils.cp(source, destination)
      puts "Installed #{destination.relative_path_from(Rails.root)}"
    end
  end
end
