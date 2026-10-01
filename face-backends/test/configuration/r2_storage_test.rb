require "test_helper"
require "digest"
require "open3"
require "rbconfig"
require "stringio"

class R2StorageTest < ActiveSupport::TestCase
  R2_ENVIRONMENT = {
    "R2_ACCESS_KEY_ID" => "test-access-key",
    "R2_SECRET_ACCESS_KEY" => "test-secret-key",
    "R2_BUCKET" => "facerail-test",
    "R2_ENDPOINT" => "https://example.r2.cloudflarestorage.com"
  }.freeze

  test "production defaults to R2 when no storage override is set" do
    assert_equal "r2", production_storage_service(nil)
  end

  test "production can explicitly switch to local storage" do
    assert_equal "local", production_storage_service("local")

    service = ActiveStorage::Service.configure(:local, r2_storage_configurations)
    assert_instance_of ActiveStorage::Service::DiskService, service
    assert_equal Rails.root.join("storage").to_s, service.root
  end

  test "configures R2 from the documented environment variables" do
    service = build_stubbed_r2_service
    config = service.client.client.config

    assert_instance_of ActiveStorage::Service::S3Service, service
    assert_equal :r2, service.name
    assert_equal "test-access-key", config.access_key_id
    assert_equal "test-secret-key", config.secret_access_key
    assert_equal "facerail-test", service.bucket.name
    assert_equal "https://example.r2.cloudflarestorage.com", config.endpoint.to_s
    assert_equal "auto", config.region
    assert config.force_path_style
    assert_equal "when_required", config.request_checksum_calculation
    assert_equal "when_required", config.response_checksum_validation
    assert config.stub_responses
  end

  test "uploads through the R2 S3 API with the Active Storage checksum" do
    service = build_stubbed_r2_service
    bytes = "test-image"
    checksum = Digest::MD5.base64digest(bytes)

    service.upload("contract-test.png", StringIO.new(bytes), checksum: checksum, content_type: "image/png")

    requests = service.client.client.api_requests
    assert_equal [:put_object], requests.map { |request| request.fetch(:operation_name) }
    upload = requests.first.fetch(:params)
    assert_equal "facerail-test", upload.fetch(:bucket)
    assert_equal "contract-test.png", upload.fetch(:key)
    assert_equal bytes, upload.fetch(:body).string
    assert_equal checksum, upload.fetch(:content_md5)
    assert_equal "image/png", upload.fetch(:content_type)
  end

  private

  def r2_storage_configurations
    original_environment = R2_ENVIRONMENT.keys.to_h { |key| [key, ENV[key]] }
    ENV.update(R2_ENVIRONMENT)
    ActiveSupport::ConfigurationFile.parse(Rails.root.join("config/storage.yml"))
  ensure
    original_environment.each { |key, value| ENV[key] = value }
  end

  def build_stubbed_r2_service
    configurations = r2_storage_configurations
    # Stub at the AWS transport boundary, retaining the real Active Storage adapter.
    configurations.fetch("r2")["stub_responses"] = true
    ActiveStorage::Service.configure(:r2, configurations)
  end

  def production_storage_service(override)
    # Load the real environment configuration without initializing production or
    # changing the running test application's configuration, database or services.
    script = <<~RUBY
      require_relative "config/application"
      load Rails.root.join("config/environments/production.rb")
      print Rails.application.config.active_storage.service
    RUBY
    output, error, status = Open3.capture3(
      { "RAILS_ENV" => "production", "ACTIVE_STORAGE_SERVICE" => override },
      RbConfig.ruby, "-e", script, chdir: Rails.root.to_s
    )
    assert status.success?, "Production configuration failed to load: #{error}"
    output
  end
end
