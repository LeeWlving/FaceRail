class FaceSample < ApplicationRecord
  belongs_to :face_collection
  has_many :face_records, dependent: :destroy

  validates :sample_key, presence: true, length: { maximum: 32 },
    format: { with: FaceCollection::NAME_FORMAT }, uniqueness: { scope: :face_collection_id }

  def api_attributes
    {
      namespace: face_collection.namespace,
      collectionName: face_collection.name,
      sampleId: sample_key,
      sampleData: MetadataFields.to_pairs(metadata),
      faces: face_records.order(:created_at).map(&:summary_attributes)
    }
  end
end
