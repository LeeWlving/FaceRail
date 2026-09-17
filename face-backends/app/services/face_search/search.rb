module FaceSearch
  class Search
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

      records = collection.face_records.includes(:face_sample).to_a
      query_faces.map { |face| serialize_result(face, records) }
    end

    private

    def serialize_result(face, records)
      threshold = @params[:confidenceThreshold].to_f
      matches = records.filter_map do |record|
        confidence = FaceRecognition::Similarity.enhanced_cosine(face.embedding, record.embedding) * 100
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
        match: matches.sort_by { |match| -match[:confidence] }.first(positive_integer(@params[:limit], 5))
      }
    end

    def positive_integer(value, default)
      number = value.to_i
      number.positive? ? number : default
    end
  end
end
