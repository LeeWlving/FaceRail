module FaceSearch
  class CreateFace
    def initialize(params)
      @params = params
    end

    def call
      collection = CollectionFinder.call(namespace: @params[:namespace], collection_name: @params[:collectionName])
      sample = collection.face_samples.find_by!(sample_key: @params[:sampleId])
      image = ImagePayload.decode(@params[:imageBase64])

      record = FaceRecord.transaction do
        face_record = sample.face_records.create!(
          face_key: SecureRandom.uuid,
          metadata: MetadataFields.normalize(@params[:faceData], collection.face_columns),
          embedding_status: :pending
        )
        face_record.source_image.attach(image.attachable(face_record.face_key))
        GenerateFaceEmbeddingJob.perform_later(
          face_record,
          score_threshold: @params[:faceScoreThreshold].to_f,
          same_sample_threshold: @params[:minConfidenceThresholdWithThisSample].to_f,
          other_sample_threshold: @params[:maxConfidenceThresholdWithOtherSample].to_f
        )
        face_record
      end

      record.summary_attributes.merge(
        namespace: collection.namespace,
        collectionName: collection.name,
        sampleId: sample.sample_key
      )
    rescue ActiveRecord::RecordNotFound
      raise Error, "sample_id is not exist"
    end

    def call_with_embedding
      collection = CollectionFinder.call(namespace: @params[:namespace], collection_name: @params[:collectionName])
      sample = collection.face_samples.find_by!(sample_key: @params[:sampleId])
      embedding = normalized_embedding(@params[:embedding])

      record = FaceRecord.transaction do
        face_record = sample.face_records.create!(
          face_key: SecureRandom.uuid,
          metadata: MetadataFields.normalize(@params[:faceData], collection.face_columns),
          embedding_status: :pending
        )
        EmbeddingThresholds.new(face_record, embedding).validate!(
          same_sample: @params[:minConfidenceThresholdWithThisSample],
          other_sample: @params[:maxConfidenceThresholdWithOtherSample]
        )
        attach_face_image(face_record) if collection.store_face_info?
        face_record.update!(
          score: @params[:faceScore].to_f,
          location: normalized_location,
          embedding:,
          embedding_status: :ready,
          embedding_error: nil
        )
        face_record
      end

      record.summary_attributes.merge(
        namespace: collection.namespace,
        collectionName: collection.name,
        sampleId: sample.sample_key
      )
    rescue ActiveRecord::RecordNotFound
      raise Error, "sample_id is not exist"
    end

    private

    def normalized_embedding(value)
      vector = Array(value).map(&:to_f)
      raise Error, "embedding must contain 512 values" unless vector.length == 512

      norm = Math.sqrt(vector.sum { |item| item**2 })
      raise Error, "embedding cannot be zero" if norm.zero?

      vector.map { |item| item / norm }
    end

    def normalized_location
      location = @params.require(:location).to_h.symbolize_keys.slice(:x, :y, :w, :h)
      raise Error, "face location is invalid" unless location.size == 4

      location.transform_values { |value| value.to_f.round }
    end

    def attach_face_image(face_record)
      raise Error, "faceImageBase64 is required when the collection stores face images" if @params[:faceImageBase64].blank?

      image = ImagePayload.decode(@params[:faceImageBase64])
      face_record.face_image.attach(image.attachable(face_record.face_key))
    end
  end
end
