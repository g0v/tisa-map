require "bundler/setup"
require "slim"
Bundler.require :default

DB = Sequel.connect(YAML.load_file("config/database.yml")["development"])
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

# Compass configuration
Compass.configuration.images_dir = 'public/img'
Compass.configuration.http_images_path = '/img'

require_relative "models/stores"
require_relative "models/companies"
require_relative "models/categories"
require_relative "models/announced_categories"
require_relative "models/announced_stats"
require_relative "models/activities"
require_relative "models/stats"


class App < Sinatra::Base

    helpers Sinatra::JSON
    set :json_encoder, :to_json
    enable :logging

    # Shenk's query interface
    get "/shenk" do
        erb :'shenk/index'
    end

    def search(token)
        results = Company.filter("name LIKE ? ", "%#{token}%").order(:name).map do |i|
            {
                pos: Regexp.new(Regexp.escape(token)) =~ i.name, 
                name: i.name, 
                url: url("company/#{i.id}")
            }
        end
        max = (results.length > 5)? 5: results.length - 1
        (0..max).each do |i|
            results.each_with_index do |item, idx|
                if results[i][:pos].nil? || (!item[:pos].nil? && item[:pos] > results[i][:pos])
                    results[i], results[idx] = results[idx], results[i] 
                end
            end
        end
        results[0..max]
    end

    post "/shenk/autocomplete" do
        token = params[:term]
        search(token).to_json
    end

    get "/shenk/search/*" do
        token = params[:keyword]
        results = search(token)
        if results.length == 0
            "not found"
        else
            erb :'shenk/search', :locals => {results: results}
        end
    end

    get "/shenk/company/:taxid" do # 統一編號
        model = Company[params[:taxid]]
        halt 404 unless model
        erb :'shenk/company', :locals => {model: model}
    end

    get "/shenk/category/:id" do
        models = AnnouncedCategory.filter({category_id: params[:id]})
        rows = {}
        activities = {}
        all_activities = []
        models.each do |model|
            rows[model.announced_id] = model
        end

        rows.each do |announced_id, model|
            activities[announced_id] = AnnouncedStat
                .filter({announced_id: announced_id})
                .order(:order)

            activities[announced_id].each do |i|
                all_activities.push i.stat_id if i.stat_id
            end
        end

        reference = {}
        all_activities.to_set.each do |stat_id|

            reference[stat_id] = {
                model:  Stat[stat_id],
                activities: Activity.filter({stat_id: stat_id}).order(:id)
            }
        end

        # halt 404 unless model
        erb :'shenk/category', :locals => {rows: rows, activities: activities, reference: reference}
    end

    get "/" do
        cache_control :no_cache, :max_age => 0
        haml :index
    end

    get "/taxid/:taxid" do # 統一編號
        json Store.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .first(taxid: params[:taxid])
    end

    post "/taxid" do
    end

    put "/taxid/:taxid" do
    end

    get "/name/:name" do # 公司名稱
        json Store.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .first(name: params[:name])
    end

    get "/business/:business" do # 所營事業項目
    end

    get "/lng/:lng/lat/:lat/radius/:radius" do # 中心點(longitude and latitude) + 半徑(meters)
        center = Oj.dump({"type" => "Point", "coordinates" => [params[:lng].to_f, params[:lat].to_f]})
        radius = params[:radius]
        offset = params[:limit].to_i * (params[:page].to_i - 1) if params[:limit] and params[:page]
        json Store.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .where { ST_DWithin(location, ST_GeomFromGeoJSON(center), radius, false) }
                  .limit(params[:limit], offset)
                  .all
    end

    post "/github/?" do
        fork { exec("sleep 5; /etc/init.d/tisa restart") }
        Oj.dump({status: "ok"})
    end

    get "/com" do
        slim :com
    end

end
