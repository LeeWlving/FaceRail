require "base64"
require "stringio"

class GenerateFaceEmbeddingJob < ApplicationJob
  queue_as :embeddings

  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(face_record, score_threshold: 0, same_sample_threshold: 0, other_sample_threshold: 0)
    return if face_record.embedding_ready?

    face_record.update!(embedding_status: :processing, embedding_error: nil)
    result = extract_face(face_record, score_threshold)
    FaceSearch::EmbeddingThresholds.new(face_record, result.embedding).validate!(
      same_sample: same_sample_threshold,
      other_sample: other_sample_threshold
    )

    attach_face_image(face_record, result.face_image) if face_record.face_collection.store_face_info?
    face_record.update!(
      score: result.score,
      location: result.location,
      embedding: result.embedding,
      embedding_status: :ready,
      embedding_error: nil
    )
    face_record.source_image.purge unless face_record.face_collection.store_face_info?
  rescue FaceSearch::Error => error
    mark_failed(face_record, error)
  rescue StandardError => error
    mark_failed(face_record, error)
    raise
  end

  private

  def extract_face(face_record, score_threshold)
    encoded = Base64.strict_encode64(face_record.source_image.download)
    result = FaceRecognition.engine.extract(encoded, score_threshold: score_threshold, limit: 1).first
    raise FaceSearch::Error, "image is not face" unless result

    result
  end

  def attach_face_image(face_record, encoded_image)
    face_record.face_image.attach(
      io: StringIO.new(Base64.strict_decode64(encoded_image)),
      filename: "#{face_record.face_key}.jpg",
      content_type: "image/jpeg"
    )
  end

  def mark_failed(face_record, error)
    face_record.update_columns(embedding_status: "failed", embedding_error: error.message, updated_at: Time.current)
  end
end
