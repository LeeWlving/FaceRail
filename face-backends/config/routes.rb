Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  concern :face_search_api do
    get "common/health/check", to: "health#show"

    post "visual/collect/create", to: "collections#create"
    get "visual/collect/delete", to: "collections#destroy"
    get "visual/collect/get", to: "collections#show"
    get "visual/collect/list", to: "collections#index"

    post "visual/sample/create", to: "samples#create"
    post "visual/sample/update", to: "samples#update"
    get "visual/sample/delete", to: "samples#destroy"
    get "visual/sample/get", to: "samples#show"
    get "visual/sample/list", to: "samples#index"

    post "visual/face/create", to: "faces#create"
    post "visual/face/create_embedding", to: "faces#create_embedding"
    get "visual/face/delete", to: "faces#destroy"

    post "visual/search/do", to: "searches#create"
    post "visual/search/embedding", to: "searches#create_embedding"
    post "visual/compare/do", to: "comparisons#create"

    get "models/:id", to: "models#show", constraints: { id: /(scrfd|arcface)/ }
  end

  scope module: :api do
    concerns :face_search_api
  end

  scope "/api", module: :api, as: :api do
    concerns :face_search_api
  end
end
