module FaceRecognition
  class << self
    attr_writer :engine

    def engine
      @engine ||= OnnxEngine.new
    end

    def reset!
      @engine = nil
    end
  end
end
