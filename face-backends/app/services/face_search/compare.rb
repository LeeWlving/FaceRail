module FaceSearch
  class Compare
    def initialize(params)
      @params = params
    end

    def call
      left = extract_one(@params[:imageBase64A], "Image A is not face")
      right = extract_one(@params[:imageBase64B], "Image B is not face")
      cosine = FaceRecognition::Similarity.enhanced_cosine(left.embedding, right.embedding)

      response = {
        distance: FaceRecognition::Similarity.euclidean(left.embedding, right.embedding).floor(4),
        confidence: (cosine * 100).floor(4)
      }
      response[:faceInfo] = face_info(left, right) if @params.fetch(:needFaceInfo, true)
      response
    end

    private

    def extract_one(image, message)
      result = FaceRecognition.engine.extract(
        image, score_threshold: @params[:faceScoreThreshold], limit: 1
      ).first
      raise Error, message unless result

      result
    end

    def face_info(left, right)
      {
        faceScoreA: left.score,
        faceScoreB: right.score,
        locationA: left.location,
        locationB: right.location
      }
    end
  end
end
