module Api
  class ComparisonsController < BaseController
    def create
      input = params.permit(:imageBase64A, :imageBase64B, :faceScoreThreshold, :needFaceInfo)
      input.require(%i[imageBase64A imageBase64B])
      render_success(FaceSearch::Compare.new(input).call)
    end
  end
end
