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
      faceData: MetadataFields.to_pairs(metadata)
    }
  end
end
