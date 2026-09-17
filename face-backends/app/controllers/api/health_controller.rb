module Api
  class HealthController < BaseController
    def show
      render_success(true)
    end
  end
end
