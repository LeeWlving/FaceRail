module Api
  class BaseController < ActionController::API
    rescue_from FaceSearch::Error, with: :render_service_error
    rescue_from ActiveRecord::RecordInvalid, with: :render_record_error
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActionController::ParameterMissing, with: :render_parameter_error

    private

    def render_success(data)
      render json: { code: 0, message: "", data: data }
    end

    def render_service_error(error)
      render json: { code: 1, message: error.message, data: nil }
    end

    def render_record_error(error)
      render json: { code: 1, message: error.record.errors.full_messages.join(", "), data: nil }
    end

    def render_not_found
      render json: { code: 1, message: "record is not exist", data: nil }
    end

    def render_parameter_error(error)
      render json: { code: 1, message: error.message, data: nil }
    end
  end
end
