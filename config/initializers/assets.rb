# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'
Rails.application.config.assets.precompile += %w( jquery.flot.js)
Rails.application.config.assets.precompile += %w( jquery.js)
Rails.application.config.assets.precompile += %w( jquery.flot.crosshair.js)
Rails.application.config.assets.precompile += %w( instrumental.function.js)
Rails.application.config.assets.precompile += %w( examples.css )
Rails.application.config.assets.precompile += %w( jquery.flot.selection.js )
Rails.application.config.assets.precompile += %w( Main.script.js )
Rails.application.config.assets.precompile += %w( adaptive.css )
# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
