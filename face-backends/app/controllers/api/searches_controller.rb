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
  end
end
