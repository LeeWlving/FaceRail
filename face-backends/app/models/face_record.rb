class FaceRecord < ApplicationRecord
  belongs_to :face_sample
  has_one :face_collection, through: :face_sample
  has_one_attached :source_image
  has_one_attached :face_image

  has_neighbors :embedding

  enum :embedding_status, {
    pending: "pending",
    processing: "processing",
    ready: "ready",
    failed: "failed"
  }, prefix: :embedding

  validates :face_key, presence: true, uniqueness: true
  validates :score, numericality: { in: 0.0..100.0 }, allow_nil: true
  validates :embedding, presence: true, if: :embedding_ready?

  scope :searchable, -> { embedding_ready.where.not(embedding: nil) }

  def summary_attributes
    {
      faceId: face_key,
      faceScore: score,
      embeddingStatus: embedding_status,
      embeddingError: embedding_error,
      thumbnailUrl: thumbnail_path,
      faceData: MetadataFields.to_pairs(metadata)
    }
  end

  private

  def thumbnail_path
    attachment = face_image.attached? ? face_image : source_image
    return unless attachment.attached?

    Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
  end
end
