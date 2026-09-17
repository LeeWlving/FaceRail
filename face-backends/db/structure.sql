CREATE TABLE IF NOT EXISTS "schema_migrations" ("version" varchar NOT NULL PRIMARY KEY);
CREATE TABLE IF NOT EXISTS "ar_internal_metadata" ("key" varchar NOT NULL PRIMARY KEY, "value" varchar, "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL);
CREATE TABLE IF NOT EXISTS "face_collections" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "namespace" varchar(12) NOT NULL, "name" varchar(24) NOT NULL, "description" varchar(128), "sample_columns" json DEFAULT '[]' NOT NULL, "face_columns" json DEFAULT '[]' NOT NULL, "store_face_info" boolean DEFAULT FALSE NOT NULL, "storage_engine" varchar DEFAULT 'CURR_DB' NOT NULL, "shards_count" integer DEFAULT 0 NOT NULL, "replicas_count" integer DEFAULT 0 NOT NULL, "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL);
CREATE UNIQUE INDEX "index_face_collections_on_namespace_and_name" ON "face_collections" ("namespace", "name");
CREATE INDEX "index_face_collections_on_namespace" ON "face_collections" ("namespace");
CREATE TABLE IF NOT EXISTS "face_samples" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "face_collection_id" integer NOT NULL, "sample_key" varchar(32) NOT NULL, "metadata" json DEFAULT '{}' NOT NULL, "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL, CONSTRAINT "fk_rails_7cae29869c"
FOREIGN KEY ("face_collection_id")
  REFERENCES "face_collections" ("id")
);
CREATE INDEX "index_face_samples_on_face_collection_id" ON "face_samples" ("face_collection_id");
CREATE UNIQUE INDEX "index_face_samples_on_face_collection_id_and_sample_key" ON "face_samples" ("face_collection_id", "sample_key");
CREATE TABLE IF NOT EXISTS "face_records" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "face_sample_id" integer NOT NULL, "face_key" varchar(36) NOT NULL, "score" float NOT NULL, "metadata" json DEFAULT '{}' NOT NULL, "location" json DEFAULT '{}' NOT NULL, "embedding" json DEFAULT '[]' NOT NULL, "source_image" text, "face_image" text, "created_at" datetime(6) NOT NULL, "updated_at" datetime(6) NOT NULL, CONSTRAINT "fk_rails_f16f1ea5dd"
FOREIGN KEY ("face_sample_id")
  REFERENCES "face_samples" ("id")
);
CREATE INDEX "index_face_records_on_face_sample_id" ON "face_records" ("face_sample_id");
CREATE UNIQUE INDEX "index_face_records_on_face_key" ON "face_records" ("face_key");
INSERT INTO "schema_migrations" (version) VALUES
('20260917000003'),
('20260917000002'),
('20260917000001');
