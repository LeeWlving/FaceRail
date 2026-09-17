require "test_helper"

class FaceCollectionTest < ActiveSupport::TestCase
  test "validates names and custom field definitions" do
    collection = FaceCollection.new(
      namespace: "Invalid Namespace",
      name: "people",
      sample_columns: [{ "name" => "age", "dataType" => "UNKNOWN" }]
    )

    assert_not collection.valid?
    assert collection.errors[:namespace].any?
    assert collection.errors[:sample_columns].any?
  end
end
