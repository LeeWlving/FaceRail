class CreateFaceRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :face_records do |t|
      t.references :face_sample, null: false, foreign_key: true
      t.string :face_key, null: false, limit: 36
      t.float :score
      t.jsonb :metadata, null: false, default: {}
      t.jsonb :location, null: false, default: {}
      t.vector :embedding, limit: 512
      t.string :embedding_status, null: false, default: "pending"
      t.text :embedding_error

      t.timestamps
    end

    add_index :face_records, :face_key, unique: true
    add_index :face_records, :embedding_status
    add_index :face_records, :embedding, using: :hnsw, opclass: :vector_cosine_ops
  end
end
