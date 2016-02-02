require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module DealsTracker
  class Application < Rails::Application

    # config.i18n.locale = :ru
    # config.i18n.default_locale = :ru
    # config.i18n.available_locales = [:ru, :en]
    # config.i18n.enforce_available_locales = true

    config.active_record.raise_in_transactional_callbacks = true
  end
end
