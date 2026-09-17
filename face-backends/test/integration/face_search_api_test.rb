require "test_helper"
require "base64"

class FaceSearchApiTest < ActionDispatch::IntegrationTest
  class FakeEngine
    attr_reader :calls

    def initialize
      @calls = []
    end

    def extract(image, score_threshold:, limit:)
      @calls << { score_threshold: score_threshold, limit: limit }
      image = Base64.strict_decode64(image)
      return [] if image == "no-face"

      vector = image == "face-b" ? [0.8, 0.2] : [1.0, 0.0]
      vector += Array.new(510, 0.0)
      [FaceRecognition::Result.new(
        score: 98.5,
        location: { x: 10, y: 20, w: 80, h: 90 },
        embedding: vector,
        face_image: Base64.strict_encode64("cropped-image")
      )].first(limit)
    end
  end

  setup do
    @engine = FakeEngine.new
    FaceRecognition.engine = @engine
    @collection = {
      namespace: "people",
      collectionName: "employees",
      collectionComment: "Employee faces",
      storageFaceInfo: true,
      sampleColumns: [
        { name: "display_name", dataType: "STRING", comment: "Name" },
        { name: "department", dataType: "STRING", comment: "Department" }
      ],
      faceColumns: [{ name: "camera", dataType: "STRING", comment: "Camera" }]
    }
  end

  teardown do
    FaceRecognition.reset!
  end

  test "collection and sample lifecycle is compatible with the visual API" do
    post "/api/visual/collect/create", params: @collection, as: :json
    assert_success(true)

    get "/api/visual/collect/get", params: @collection.slice(:namespace, :collectionName)
    assert_success
    assert_equal "Employee faces", response_data.fetch("collectionComment")

    create_sample
    get "/api/visual/sample/get", params: sample_identity
    assert_success
    assert_equal "Alice", response_data.fetch("sampleData").find { |item| item["key"] == "display_name" }.fetch("value")

    post "/api/visual/sample/update", params: sample_identity.merge(
      sampleData: [{ key: "display_name", value: "Alice Chen" }]
    ), as: :json
    assert_success(true)

    get "/api/visual/sample/list", params: sample_identity.slice(:namespace, :collectionName).merge(limit: 10, offset: 0)
    sample_data = response_data.first.fetch("sampleData").to_h { |item| [item.fetch("key"), item.fetch("value")] }
    assert_equal "Alice Chen", sample_data.fetch("display_name")
    assert_equal "Engineering", sample_data.fetch("department")
  end

  test "face creation, search, compare and cascading deletion" do
    post "/api/visual/collect/create", params: @collection, as: :json
    created_face = create_sample(image: "face-a", face_data: [{ key: "camera", value: "lobby" }])
    face_id = created_face.fetch("faceId")
    assert_equal "pending", response_data.fetch("embeddingStatus")

    face_record = FaceRecord.find_by!(face_key: face_id)
    GenerateFaceEmbeddingJob.perform_now(face_record)
    face_record.reload
    assert face_record.embedding_ready?
    assert face_record.source_image.attached?
    assert face_record.face_image.attached?

    post "/api/visual/search/do", params: @collection.slice(:namespace, :collectionName).merge(
      imageBase64: encoded("face-a")
    ), as: :json
    assert_success
    assert_equal({ score_threshold: nil, limit: 5 }, @engine.calls.last)
    match = response_data.first.fetch("match").first
    assert_equal "alice", match.fetch("sampleId")
    assert_equal 100.0, match.fetch("confidence")

    post "/api/visual/compare/do", params: {
      imageBase64A: encoded("face-a"), imageBase64B: encoded("face-b")
    }, as: :json
    assert_success
    assert response_data.fetch("confidence") > 90
    assert_equal 10, response_data.dig("faceInfo", "locationA", "x")

    get "/api/visual/face/delete", params: sample_identity.merge(faceId: face_id)
    assert_success(true)
    assert_equal 0, FaceRecord.count

    get "/api/visual/sample/delete", params: sample_identity
    assert_success(true)
    get "/api/visual/collect/delete", params: @collection.slice(:namespace, :collectionName)
    assert_success(true)
  end

  test "errors keep the response contract used by the frontend" do
    get "/api/visual/collect/get", params: { namespace: "missing", collectionName: "missing" }

    assert_response :success
    assert_equal 1, parsed_response.fetch("code")
    assert_equal "collection is not exist", parsed_response.fetch("message")
  end

  test "embedding failures are recorded for asynchronous face creation" do
    post "/api/visual/collect/create", params: @collection, as: :json
    create_sample(image: "no-face")

    face_record = FaceRecord.find_by!(face_key: response_data.fetch("faceId"))
    GenerateFaceEmbeddingJob.perform_now(face_record)
    face_record.reload

    assert face_record.embedding_failed?
    assert_equal "image is not face", face_record.embedding_error
    assert_nil face_record.embedding
  end

  private

  def create_sample(image: nil, face_data: nil)
    payload = sample_identity.merge(
      sampleData: [
        { key: "display_name", value: "Alice" },
        { key: "department", value: "Engineering" }
      ]
    )
    payload[:imageBase64] = encoded(image) if image
    payload[:faceData] = face_data if face_data
    post "/api/visual/sample/create", params: payload, as: :json
    assert_success(image ? nil : true)
    response_data
  end

  def sample_identity
    { namespace: "people", collectionName: "employees", sampleId: "alice" }
  end

  def encoded(value)
    Base64.strict_encode64(value)
  end

  def parsed_response
    JSON.parse(response.body)
  end

  def response_data
    parsed_response.fetch("data")
  end

  def assert_success(data = nil)
    assert_response :success
    assert_equal 0, parsed_response.fetch("code"), parsed_response.fetch("message")
    assert_equal data, response_data unless data.nil?
  end
end
