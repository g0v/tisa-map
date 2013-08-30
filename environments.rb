require "bundler/setup"
Bundler.require :default

DB = Sequel.connect(YAML.load_file("config/database.yml")["development"])
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

require_relative "models/stores"

class App < Sinatra::Base

    helpers Sinatra::JSON
    set :json_encoder, :to_json
    set :public_folder, "src"
    enable :logging

    get "/" do
        cache_control :no_cache, :max_age => 0
        haml :index
    end

    get "/taxid/:taxid" do # 統一編號
        json Store.select(:name, :taxid)
                  .select_append { ST_AsGeoJSON(location).as(location) }
                  .first(taxid: params[:taxid])
    end

    post "/taxid" do
    end

    put "/taxid/:taxid" do
    end

    get "/name/:name" do # 公司名稱
        json Store.select(:name, :taxid)
                  .select_append { ST_AsGeoJSON(location).as(location) }
                  .first(name: params[:name])
    end

    get "/business/:business" do # 所營事業項目
    end

    get "/lng/:lng/lat/:lat/radius/:radius" do # 中心點(longitude and latitude) + 半徑(meters)
        center = Oj.dump({"type" => "Point", "coordinates" => [params[:lng].to_f, params[:lat].to_f]})
        @stores = Store.fetch("select id, ST_AsGeoJSON(location) as location, name, taxid from stores where ST_DWithin(location, ST_GeomFromGeoJSON('#{center}'), #{params[:radius]}, false);").all
        json @stores
    end

end
