require "./environments"

map "/assets" do
    assets = Sprockets::Environment.new do |env|
        env.append_path "assets/stylesheets"
        env.append_path "assets/javascripts"
        env.append_path "assets/templates"
    end
    run assets
end

run App
