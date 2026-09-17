class RecoverStaleFaceEmbeddingsJob < ApplicationJob
  queue_as :default

  STALE_AFTER = 5.minutes

  def perform
    FaceRecord.embedding_processing.where(updated_at: ...STALE_AFTER.ago).find_each do |face_record|
      face_record.update!(embedding_status: :pending, embedding_error: "embedding worker stopped; retrying")
      GenerateFaceEmbeddingJob.perform_later(face_record)
    end
  end
end
