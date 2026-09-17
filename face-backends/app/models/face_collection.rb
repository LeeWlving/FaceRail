class FaceCollection < ApplicationRecord
  NAME_FORMAT = /\A[a-z0-9_]+\z/
  COLUMN_TYPES = %w[BOOL DOUBLE FLOAT INT STRING].freeze

  has_many :face_samples, dependent: :destroy
  has_many :face_records, through: :face_samples

  validates :namespace, presence: true, length: { maximum: 12 }, format: { with: NAME_FORMAT }
  validates :name, presence: true, length: { maximum: 24 }, format: { with: NAME_FORMAT }, uniqueness: { scope: :namespace }
  validates :description, length: { maximum: 128 }, allow_blank: true
  validates :storage_engine, inclusion: { in: %w[CURR_DB ALI_OSS TCE_COS MIN_IO] }
  validate :validate_column_definitions

  def api_attributes
    {
      namespace: namespace,
      collectionName: name,
      collectionComment: description,
      sampleColumns: sample_columns,
      faceColumns: face_columns,
      storageFaceInfo: store_face_info,
      storageEngine: storage_engine,
      shardsNum: shards_count,
      replicasNum: replicas_count
    }
  end

  private

  def validate_column_definitions
    validate_columns(:sample_columns, sample_columns)
    validate_columns(:face_columns, face_columns)
  end

  def validate_columns(attribute, columns)
    unless columns.is_a?(Array)
      errors.add(attribute, "must be an array")
      return
    end

    names = columns.filter_map { |column| column["name"] || column[:name] }
    errors.add(attribute, "contains duplicate names") if names.uniq.length != names.length

    columns.each do |column|
      name = column["name"] || column[:name]
      type = column["dataType"] || column[:dataType]
      errors.add(attribute, "contains an invalid name") unless name.to_s.match?(NAME_FORMAT) && name.to_s.length <= 32
      errors.add(attribute, "contains an invalid dataType") unless COLUMN_TYPES.include?(type)
    end
  end
end
