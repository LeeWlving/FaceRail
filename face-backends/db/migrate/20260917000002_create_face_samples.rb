class CreateFaceSamples < ActiveRecord::Migration[8.1]
  def change
    create_table :face_samples do |t|
      t.references :face_collection, null: false, foreign_key: true
      t.string :sample_key, null: false, limit: 32
      t.json :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :face_samples, %i[face_collection_id sample_key], unique: true
  end
end
