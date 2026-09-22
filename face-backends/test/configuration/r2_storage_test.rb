require "test_helper"

class R2StorageTest < ActiveSupport::TestCase
  test "configures the R2 S3-compatible Active Storage service" do
    configurations = ActiveSupport::ConfigurationFile.parse(Rails.root.join("config/storage.yml"))
    configurations.fetch("r2").merge!(
      "access_key_id" => "test-access-key",
      "secret_access_key" => "test-secret-key",
      "bucket" => "facerail-test",
      "endpoint" => "https://example.r2.cloudflarestorage.com"
    )

    service = ActiveStorage::Service.configure(:r2, configurations)

    assert_instance_of ActiveStorage::Service::S3Service, service
    assert_equal :r2, service.name
    assert_equal "when_required", service.client.client.config.request_checksum_calculation
    assert_equal "when_required", service.client.client.config.response_checksum_validation
  end
end
