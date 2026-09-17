require "test_helper"

module FaceRecognition
  class OnnxEngineTest < ActiveSupport::TestCase
    class RecordingEngine < OnnxEngine
      attr_reader :calls

      def initialize(results)
        @results = results
        @calls = []
      end

      private

      def detect(candidate, threshold)
        @calls << [candidate.width, candidate.height, threshold]
        @results.shift
      end
    end

    test "adds a border after an empty detection and restores original coordinates" do
      image = Vips::Image.black(100, 80, bands: 3)
      detected_face = {
        score: 0.8,
        location: { x: 40.0, y: 30.0, w: 50.0, h: 60.0 },
        points: [[45.0, 35.0], [70.0, 35.0]]
      }
      engine = RecordingEngine.new([[], [detected_face]])

      faces = engine.send(:detect_with_fallback, image, 0.5)

      assert_equal [[100, 80, 0.5], [170, 136, 0.5]], engine.calls
      assert_equal({ x: 5.0, y: 2.0, w: 50.0, h: 60.0 }, faces.first[:location])
      assert_equal [[10.0, 7.0], [35.0, 7.0]], faces.first[:points]
    end

    test "does not retry when the original image contains a face" do
      image = Vips::Image.black(100, 80, bands: 3)
      face = { score: 0.9, location: {}, points: [] }
      engine = RecordingEngine.new([[face]])

      faces = engine.send(:detect_with_fallback, image, 0.5)

      assert_equal [[100, 80, 0.5]], engine.calls
      assert_equal [face], faces
    end
  end
end
