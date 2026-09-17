module FaceRecognition
  module Similarity
    module_function

    def cosine(left, right)
      raise FaceSearch::Error, "vector length not equal" unless left.length == right.length

      dot = left.zip(right).sum { |a, b| a.to_f * b.to_f }
      magnitude = Math.sqrt(left.sum { |value| value.to_f**2 }) * Math.sqrt(right.sum { |value| value.to_f**2 })
      magnitude.zero? ? 0.0 : dot / magnitude
    end

    def enhanced_cosine(left, right)
      enhance(cosine(left, right))
    end

    def enhance(cosine)
      if cosine >= 0.5
        cosine + (2 * (cosine - 0.5) * (1 - cosine))
      elsif cosine >= 0
        cosine - (2 * (cosine - 0.5) * -cosine)
      else
        cosine
      end
    end

    def euclidean(left, right)
      raise FaceSearch::Error, "vector length not equal" unless left.length == right.length

      Math.sqrt(left.zip(right).sum { |a, b| (a.to_f - b.to_f)**2 })
    end
  end
end
