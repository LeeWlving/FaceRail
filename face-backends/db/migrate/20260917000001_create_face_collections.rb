class CreateFaceCollections < ActiveRecord::Migration[8.1]
  def change
    create_table :face_collections do |t|
      t.string :namespace, null: false, limit: 12
      t.string :name, null: false, limit: 24
      t.string :description, limit: 128
      t.json :sample_columns, null: false, default: []
      t.json :face_columns, null: false, default: []
      t.boolean :store_face_info, null: false, default: false
      t.string :storage_engine, null: false, default: "CURR_DB"
      t.integer :shards_count, null: false, default: 0
      t.integer :replicas_count, null: false, default: 0

      t.timestamps
    end

    add_index :face_collections, %i[namespace name], unique: true
    add_index :face_collections, :namespace
  end
end
