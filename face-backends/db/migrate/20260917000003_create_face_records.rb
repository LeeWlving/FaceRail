class CreateFaceRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :face_records do |t|
      t.references :face_sample, null: false, foreign_key: true
      t.string :face_key, null: false, limit: 36
      t.float :score, null: false
      t.json :metadata, null: false, default: {}
      t.json :location, null: false, default: {}
      t.json :embedding, null: false, default: []
      t.text :source_image
      t.text :face_image

      t.timestamps
    end

    add_index :face_records, :face_key, unique: true
  end
end
