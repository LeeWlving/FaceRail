class FaceRecord < ApplicationRecord
  belongs_to :face_sample
  has_one :face_collection, through: :face_sample

  validates :face_key, presence: true, uniqueness: true
  validates :score, numericality: { in: 0.0..100.0 }
  validate :embedding_must_be_present

  def summary_attributes
    {
      faceId: face_key,
      faceScore: score,
      faceData: MetadataFields.to_pairs(metadata)
    }
  end

  private

  def embedding_must_be_present
    errors.add(:embedding, "cannot be empty") unless embedding.is_a?(Array) && embedding.any?
  end
end
