module FaceSearch
  class Search
    DEFAULT_LIMIT = 20
    MAX_LIMIT = 100

    def initialize(params)
      @params = params
    end

    def call
      collection = CollectionFinder.call(namespace: @params[:namespace], collection_name: @params[:collectionName])
      query_faces = FaceRecognition.engine.extract(
        @params[:imageBase64],
        score_threshold: @params[:faceScoreThreshold],
        limit: positive_integer(@params[:maxFaceNum], 5)
      )
      raise Error, "image is not face" if query_faces.empty?

      query_faces.map { |face| serialize_result(face, collection) }
    end

    private

    def serialize_result(face, collection)
      threshold = @params[:confidenceThreshold].to_f
      records = collection.face_records.searchable
        .includes(:face_sample)
        .nearest_neighbors(:embedding, face.embedding, distance: "cosine")
        .limit(result_limit)

      matches = records.filter_map do |record|
        cosine = 1 - record.neighbor_distance.to_f
        confidence = FaceRecognition::Similarity.enhance(cosine) * 100
        next if confidence < threshold

        {
          sampleId: record.face_sample.sample_key,
          faceId: record.face_key,
          faceScore: record.score,
          confidence: confidence.floor(4),
          sampleData: MetadataFields.to_pairs(record.face_sample.metadata),
          faceData: MetadataFields.to_pairs(record.metadata)
        }
      end

      {
        location: face.location,
        faceScore: face.score,
        match: matches
      }
    end

    def result_limit
      [positive_integer(@params[:limit], DEFAULT_LIMIT), MAX_LIMIT].min
    end

    def positive_integer(value, default)
      number = value.to_i
      number.positive? ? number : default
    end
  end
end
