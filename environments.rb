require "bundler/setup"
Bundler.require :default

DB = Sequel.connect("postgres://localhost/test")
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

require_relative "models/stores"

class App < Sinatra::Base

    helpers Sinatra::JSON
    set :json_encoder, :to_json
    enable :logging

    get "/taxid/:taxid" do # 統一編號
        @store = Store.fetch("select id, ST_AsGeoJSON(location) as location, name, taxid from stores where taxid = '#{params[:taxid]}';").first
        json @store
    end

    post "/taxid" do
    end

    put "/taxid/:taxid" do
    end

    get "/name/:name" do # 公司名稱
    end

    get "/business/:business" do # 所營事業項目
    end

    get "/center/:center/radius/:radius" do # 中心點 + 半徑
    end

end
