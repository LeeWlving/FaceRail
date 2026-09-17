module FaceSearch
  class CreateFace
    def initialize(params)
      @params = params
    end

    def call
      collection = CollectionFinder.call(namespace: @params[:namespace], collection_name: @params[:collectionName])
      sample = collection.face_samples.find_by!(sample_key: @params[:sampleId])
      result = FaceRecognition.engine.extract(
        @params[:imageBase64], score_threshold: @params[:faceScoreThreshold], limit: 1
      ).first
      raise Error, "image is not face" unless result

      check_same_sample_threshold!(sample, result.embedding)
      check_other_sample_threshold!(collection, sample, result.embedding)

      record = sample.face_records.create!(
        face_key: SecureRandom.uuid,
        score: result.score,
        metadata: MetadataFields.normalize(@params[:faceData], collection.face_columns),
        location: result.location,
        embedding: result.embedding,
        source_image: collection.store_face_info? ? @params[:imageBase64] : nil,
        face_image: collection.store_face_info? ? result.face_image : nil
      )

      record.summary_attributes.merge(
        namespace: collection.namespace,
        collectionName: collection.name,
        sampleId: sample.sample_key
      )
    rescue ActiveRecord::RecordNotFound
      raise Error, "sample_id is not exist"
    end

    private

    def check_same_sample_threshold!(sample, embedding)
      threshold = @params[:minConfidenceThresholdWithThisSample].to_f
      return unless threshold.positive? && sample.face_records.exists?

      confidence = sample.face_records.to_a.map do |face|
        FaceRecognition::Similarity.enhanced_cosine(embedding, face.embedding) * 100
      end.max
      raise Error, "this face confidence is less than minConfidenceThresholdWithThisSample" if confidence < threshold
    end

    def check_other_sample_threshold!(collection, sample, embedding)
      threshold = @params[:maxConfidenceThresholdWithOtherSample].to_f
      other_faces = collection.face_records.where.not(face_sample_id: sample.id)
      return unless threshold.positive? && other_faces.exists?

      confidence = other_faces.to_a.map do |face|
        FaceRecognition::Similarity.enhanced_cosine(embedding, face.embedding) * 100
      end.max
      raise Error, "this face confidence is gather than maxConfidenceThresholdWithOtherSample" if confidence > threshold
    end
  end
end
