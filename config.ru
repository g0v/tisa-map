require "./environments"

map "/assets" do
    assets = Sprockets::Environment.new do |env|
        env.append_path "assets/stylesheets"
        env.append_path "assets/javascripts"
        env.append_path "assets/templates"

        # bootstrap-sass requires asset_path in Sprocket environment
        env.context_class.class_eval do
          def asset_path(path, options = {})
            "/assets/#{path}"
          end
        end

    end
    run assets
end

run App
