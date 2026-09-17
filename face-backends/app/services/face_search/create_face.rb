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
  end
end
