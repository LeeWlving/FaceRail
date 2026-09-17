require "base64"
require "stringio"

class ImagePayload
  CONTENT_TYPES = {
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp"
  }.freeze

  DataValue = Data.define(:bytes, :content_type, :extension) do
    def attachable(filename)
      { io: StringIO.new(bytes), filename: "#{filename}.#{extension}", content_type: content_type }
    end
  end

  def self.decode(value)
    content_type, encoded = parse(value.to_s)
    bytes = Base64.strict_decode64(encoded)
    raise FaceSearch::Error, "imageBase64 cannot be empty" if bytes.empty?

    DataValue.new(bytes:, content_type:, extension: CONTENT_TYPES.fetch(content_type))
  rescue ArgumentError
    raise FaceSearch::Error, "imageBase64 is invalid"
  end

  def self.parse(value)
    match = value.match(/\Adata:(image\/(?:jpeg|png|webp));base64,(.+)\z/m)
    return [match[1], match[2]] if match

    ["image/jpeg", value]
  end
  private_class_method :parse
end
