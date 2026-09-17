module FaceSearch
  class EmbeddingThresholds
    def initialize(face_record, embedding)
      @face_record = face_record
      @embedding = embedding
    end

    def validate!(same_sample:, other_sample:)
      validate_same_sample!(same_sample.to_f)
      validate_other_samples!(other_sample.to_f)
    end

    private

    def validate_same_sample!(threshold)
      return unless threshold.positive?

      scope = FaceRecord.searchable.where(face_sample_id: @face_record.face_sample_id)
      confidence = nearest_confidence(scope)
      return if confidence.nil? || confidence >= threshold

      raise Error, "this face confidence is less than minConfidenceThresholdWithThisSample"
    end

    def validate_other_samples!(threshold)
      return unless threshold.positive?

      collection_id = @face_record.face_sample.face_collection_id
      scope = FaceRecord.searchable.joins(:face_sample)
        .where(face_samples: { face_collection_id: collection_id })
        .where.not(face_sample_id: @face_record.face_sample_id)
      confidence = nearest_confidence(scope)
      return if confidence.nil? || confidence <= threshold

      raise Error, "this face confidence is gather than maxConfidenceThresholdWithOtherSample"
    end

    def nearest_confidence(scope)
      nearest = scope.nearest_neighbors(:embedding, @embedding, distance: "cosine").first
      return unless nearest

      FaceRecognition::Similarity.enhance(1 - nearest.neighbor_distance.to_f) * 100
    end
  end
end
