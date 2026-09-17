module FaceSearch
  class CollectionFinder
    def self.call(namespace:, collection_name:)
      FaceCollection.find_by!(namespace: namespace, name: collection_name)
    rescue ActiveRecord::RecordNotFound
      raise Error, "collection is not exist"
    end
  end
end
