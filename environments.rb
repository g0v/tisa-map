# encoding: utf-8

require "bundler/setup"
require "sinatra/content_for"
require "slim"
require 'cgi'
Bundler.require :default

DB = Sequel.connect(YAML.load_file("config/database.yml")["development"])
DB.extension :pg_array
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
    helpers Sinatra::ContentFor
    helpers do
        def com_like_url
            CGI.unescape url("/com")
        end
    end

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
                url: url("shenk/company/#{i.id}")
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

    # 「你被服貿了嗎」homepage.
    get "/com" do

        # Nested templates: _layout > _query > index
        slim :'com/_query', layout: :'com/_layout' do
            slim :'com/index'
        end
    end

    # Display the search result for a specific keyword.
    get "/com/search" do
        keyword = params[:keyword]

        # Database mock data
        companies = [
            {value: "54151855", text: "佈思股份有限公司"},
            {value: "55555555", text: "科高股份有限公司"},
        ]
        categories = [
            {value: "I301010", text: "資訊軟體服務業"},
            {value: "I301011", text: "資訊軟體服務業2"},
            {value: "I301012", text: "資訊軟體服務業3"}
        ]

        # Nested templates: _layout > _query > search
        slim :'com/_query', layout: :'com/_layout' do
            slim :'com/search', locals: {
                keyword: keyword,
                companies: companies,
                categories: categories
            }
        end
    end

    # Display the company's categories.
    get "/com/category/:id" do

        # Database mock data
        company = {
            id: params[:id],
            name: '佈思股份有限公司'
        }
        categories = [
            {value: "I301010", text: "資訊軟體服務業"},
            {value: "I301011", text: "資訊軟體服務業2"},
            {value: "I301012", text: "資訊軟體服務業3"},
            {value: "I30012", text: "資訊軟體服務業rrr"}
        ]

        slim :'com/_query', layout: :'com/_layout' do
            slim :'com/category', locals: {
                company: company,
                categories: categories
            }
        end
    end

    # Display the comparison result for a company ID or industry ID
    get "/com/?" do
        company_id = params[:id]
        category_ids = params[:cat]

        # The categories that are affected.
        # Database mock data
        matched_categories = [
            {value: "I301010", text: "資訊軟體服務業", original: "這段目前是假字這段目前是假字這段目前是假字。性後注正來廣電要那個列就……作覺分臺斷產中活情、好為服，這事不可回外油然以成，親背來史裡人和裝體方性，會府利了了藝子因弟在寫一過兒事言常已的排金看到：年的區文人行其，起技南！制生個功有位方見國年何不地學了步定密氣小飛自要得意分個油覺術發故度孩春大班小下他水識裡畫：體起是像可一美靈要個態我印開到……示的市必備雜照無語流老我密，心食中影的羅第！", translated: "這段是條文原文文言文這兒願活又總父入不不一有……不年友友景理了大兒學？喜出環內溫打準到旅深轉有人、為了非，看說條就利去麗在。該他那請得後包重火藝，友來同教來林花兒力解，學提流千遊，般科造景樂重眾理……地有成期？那裡決利歡明被開雨同！體卻出光內請裡工度手，著手想、明出媽最。不方願這王不了下從？
            一適為好推裡過充院下三自問……間裡陽發是演政次書為。密實備樓笑是？了該身生數來計行，果增真應關一地畫三西信來為一坡他原維孩各是間，買讓家地成如！為時最其生覺有業山，時先而請：期我表商適給國：學感須的好了笑找角王力用亞減當沒就他作一嗎。"},
            {value: "I301011", text: "資訊軟體服務業2", original: "這段目前是假字這段目前是假字", translated: "這段是條文原文文言文"},
            {value: "I301012", text: "資訊軟體服務業3", original: "這段目前是假字這段目前是假字", translated: "這段是條文原文文言文"}
        ]

        share_url = url("/com/?id=#{company_id}&#{category_ids.map{|c| 'cat[]='+c}.join('&')}")

        # Populate locals
        locals = {
            categories: matched_categories,
            share_url: CGI.escape(share_url)
        }
        unless company_id.nil?
            # Database mock data
            locals[:company] = {
                id: params[:id],
                name: '佈思股份有限公司'
            }
        end

        if matched_categories.empty?
            slim :'com/result_not_affected', layout: :'com/_layout', locals: locals
        else
            slim :'com/result_affected', layout: :'com/_layout', locals: locals
        end
    end

    # Satisfaction voting.
    # Ajax API.
    post '/com/poll' do

        # Return an array of percentages.
        # Database mock data
        json({results: [67, 12, 2, 5, 6, 8, 0]})
    end
end
