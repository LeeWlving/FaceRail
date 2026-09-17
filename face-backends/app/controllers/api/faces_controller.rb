module Api
  class FacesController < BaseController
    def create
      input = params.permit(
        :namespace, :collectionName, :sampleId, :imageBase64,
        :faceScoreThreshold, :minConfidenceThresholdWithThisSample,
        :maxConfidenceThresholdWithOtherSample, faceData: %i[key value]
      )
      input.require(%i[namespace collectionName sampleId imageBase64])
      render_success(FaceSearch::CreateFace.new(input).call)
    end

    def create_embedding
      input = params.permit(
        :namespace, :collectionName, :sampleId, :faceScore, :faceImageBase64,
        :minConfidenceThresholdWithThisSample, :maxConfidenceThresholdWithOtherSample,
        embedding: [], location: %i[x y w h], faceData: %i[key value]
      )
      input.require(%i[namespace collectionName sampleId embedding location])
      render_success(FaceSearch::CreateFace.new(input).call_with_embedding)
    end

    def destroy
      collection = FaceSearch::CollectionFinder.call(
        namespace: params.require(:namespace), collection_name: params.require(:collectionName)
      )
      sample = collection.face_samples.find_by!(sample_key: params.require(:sampleId))
      sample.face_records.find_by!(face_key: params.require(:faceId)).destroy!
      render_success(true)
    rescue ActiveRecord::RecordNotFound
      raise FaceSearch::Error, "face id is not exist"
    end
  end
end
