class MetadataFields
  class << self
    def normalize(pairs, definitions)
      values = Array(pairs).each_with_object({}) do |pair, result|
        key = pair["key"] || pair[:key]
        result[key] = pair.key?("value") ? pair["value"] : pair[:value] if key.present?
      end

      definitions.each_with_object({}) do |definition, result|
        name = definition["name"] || definition[:name]
        next unless values.key?(name)

        result[name] = cast(values[name], definition["dataType"] || definition[:dataType])
      end
    end

    def to_pairs(metadata)
      (metadata || {}).map { |key, value| { key: key, value: value } }
    end

    private

    def cast(value, type)
      case type
      when "BOOL" then ActiveModel::Type::Boolean.new.cast(value)
      when "INT" then Integer(value)
      when "DOUBLE", "FLOAT" then Float(value)
      when "STRING" then value.to_s.first(512)
      else value
      end
    rescue ArgumentError, TypeError
      raise FaceSearch::Error, "invalid value for #{type} field"
    end
  end
end
