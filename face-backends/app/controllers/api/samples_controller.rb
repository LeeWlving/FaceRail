module Api
  class SamplesController < BaseController
    def create
      sample_collection.face_samples.create!(
        sample_key: sample_params.require(:sampleId),
        metadata: normalized_metadata
      )
      render_success(true)
    end

    def update
      raise FaceSearch::Error, "sample data is not void" if sample_params[:sampleData].blank?

      sample.update!(metadata: sample.metadata.merge(normalized_metadata))
      render_success(true)
    end

    def destroy
      sample.destroy!
      render_success(true)
    end

    def show
      render_success(sample.api_attributes)
    end

    def index
      order = params[:order].to_s.downcase == "desc" ? :desc : :asc
      samples = sample_collection.face_samples.includes(:face_records)
        .order(created_at: order)
        .offset([params.fetch(:offset, 0).to_i, 0].max)
        .limit([[params.fetch(:limit, 10).to_i, 1].max, 100].min)
      render_success(samples.map(&:api_attributes))
    end

    private

    def sample_params
      params.permit(:namespace, :collectionName, :sampleId, sampleData: %i[key value])
    end

    def sample_collection
      @sample_collection ||= FaceSearch::CollectionFinder.call(
        namespace: params.require(:namespace), collection_name: params.require(:collectionName)
      )
    end

    def sample
      @sample ||= sample_collection.face_samples.find_by!(sample_key: params.require(:sampleId))
    rescue ActiveRecord::RecordNotFound
      raise FaceSearch::Error, "sample_id is not exist"
    end

    def normalized_metadata
      MetadataFields.normalize(sample_params[:sampleData], sample_collection.sample_columns)
    end
  end
end
