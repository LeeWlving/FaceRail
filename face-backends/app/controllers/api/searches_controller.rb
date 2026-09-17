module Api
  class SearchesController < BaseController
    def create
      input = params.permit(
        :namespace, :collectionName, :imageBase64, :faceScoreThreshold,
        :confidenceThreshold, :limit, :maxFaceNum
      )
      input.require(%i[namespace collectionName imageBase64])
      render_success(FaceSearch::Search.new(input).call)
    end

    def create_embedding
      input = params.permit(
        :namespace, :collectionName, :confidenceThreshold, :limit,
        faces: [:faceScore, { embedding: [], location: %i[x y w h] }]
      )
      input.require(%i[namespace collectionName faces])
      render_success(FaceSearch::Search.new(input).call_with_embeddings)
    end
  end
end
