module Api
  class CollectionsController < BaseController
    def create
      FaceCollection.create!(collection_attributes)
      render_success(true)
    end

    def destroy
      collection.destroy!
      render_success(true)
    end

    def show
      render_success(collection.api_attributes)
    end

    def index
      collections = FaceCollection.where(namespace: params.require(:namespace)).order(:created_at)
      render_success(collections.map(&:api_attributes))
    end

    private

    def collection
      @collection ||= FaceSearch::CollectionFinder.call(
        namespace: params.require(:namespace), collection_name: params.require(:collectionName)
      )
    end

    def collection_attributes
      input = params.permit(
        :namespace, :collectionName, :collectionComment, :storageFaceInfo,
        :storageEngine, :shardsNum, :replicasNum,
        sampleColumns: %i[name dataType comment], faceColumns: %i[name dataType comment]
      )
      {
        namespace: input.require(:namespace),
        name: input.require(:collectionName),
        description: input[:collectionComment],
        sample_columns: Array(input[:sampleColumns]).map(&:to_h),
        face_columns: Array(input[:faceColumns]).map(&:to_h),
        store_face_info: input[:storageFaceInfo] || false,
        storage_engine: "ACTIVE_STORAGE",
        shards_count: input[:shardsNum] || 0,
        replicas_count: input[:replicasNum] || 0
      }
    end
  end
end
