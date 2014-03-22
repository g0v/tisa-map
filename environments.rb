# encoding: utf-8

require "bundler/setup"
require "sinatra/content_for"
require "slim"
require 'cgi'
Bundler.require :default

DB = Sequel.connect(YAML.load_file("config/database.yml")[ENV['RACK_ENV'] || "development"])
DB.extension :pg_array, :pg_json
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

# Compass configuration
Compass.configuration.images_dir = 'public/img'
Compass.configuration.http_images_path = '/img'

Dir["models/*.rb"].each do |file|
    require_relative file
end

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

    # Shenk's reference implementation
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

        # 5 times per search, sort by position
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

    get "/map" do
        cache_control :no_cache, :max_age => 0
        slim :'map', layout: :'layout/_layout'
    end

    get "/ly" do
        slim :'ly', layout: :'layout/_layout'
    end

    get "/taxid/:taxid" do # 統一編號
        json Company.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .first(taxid: params[:taxid])
    end

    post "/taxid" do
    end

    put "/taxid/:taxid" do
    end

    get "/name/:name" do # 公司名稱
        json Company.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .first(name: params[:name])
    end

    get "/business/:business" do # 所營事業項目
    end

    get "/lng/:lng/lat/:lat/radius/:radius" do # 中心點(longitude and latitude) + 半徑(meters)
        center = Oj.dump({"type" => "Point", "coordinates" => [params[:lng].to_f, params[:lat].to_f]})
        radius = params[:radius]
        offset = params[:limit].to_i * (params[:page].to_i - 1) if params[:limit] and params[:page]
        json Company.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                  .where { ST_DWithin(location, ST_GeomFromGeoJSON(center), radius, false) }
                  .limit(params[:limit], offset)
                  .all
    end

    post "/github/?" do
        fork { exec("sleep 5; /etc/init.d/tisa restart") }
        Oj.dump({status: "ok"})
    end

    # 「你被服貿了嗎」homepage.
    get "/" do

        # Nested templates: _layout > _query > index
        slim :'layout/_query', layout: :'layout/_layout' do
            slim :'index'
        end
    end

    # Text-matching companies' name, given token.
    def search_company(token)
        results = Company.filter("name LIKE ? ", "%#{token}%").order(:name).map do |i|
            {
                pos: Regexp.new(Regexp.escape(token)) =~ i.name,
                value: i.name,
                id: i.taxid
            }
        end

        # 5 response at most
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

    # Display the search result for a specific keyword.
    get "/search" do
        keyword = params[:keyword]

        companies = search_company(keyword)

        # Database mock data
        categories = [
            {id: "I301010", value: "資訊軟體服務業"},
            {id: "I301011", value: "資訊軟體服務業2"},
            {id: "I301012", value: "資訊軟體服務業3"}
        ]

        # Nested templates: _layout > _query > search
        slim :'layout/_query', layout: :'layout/_layout' do
            slim :'search', locals: {
                keyword: keyword,
                companies: companies,
                categories: categories
            }
        end
    end

    # Autocomplete
    get "/complete/:term" do
        search_company(params[:term]).map{|c| c[:type]="公司行號"; c}.to_json
    end

    # Display the company's categories.
    get "/company/:tax_id" do

        company = Company.filter(taxid: params[:tax_id]).first

        # Database mock data
        categories = [
           {id: "I301010", value: "資訊軟體服務業"},
           {id: "I301011", value: "資訊軟體服務業2"},
           {id: "I301012", value: "資訊軟體服務業3"},
           {id: "I30012", value: "資訊軟體服務業rrr"}
        ]

        slim :'layout/_query', layout: :'layout/_layout' do
            slim :'category', locals: {
                company: company,
                categories: categories
            }
        end
    end

    # Display the comparison result for a company ID or industry ID
    get "/result/?" do
        company_id = params[:id]
        category_ids = params[:cat]

        # The categories that are affected.
        # Database mock data
        matched_categories = [
            {id: "I301010", value: "資訊軟體服務業", translated: "這段目前是假字這段目前是假字這段目前是假字。性後注正來廣電要那個列就……作覺分臺斷產中活情、好為服，這事不可回外油然以成，親背來史裡人和裝體方性，會府利了了藝子因弟在寫一過兒事言常已的排金看到：年的區文人行其，起技南！制生個功有位方見國年何不地學了步定密氣小飛自要得意分個油覺術發故度孩春大班小下他水識裡畫：體起是像可一美靈要個態我印開到……示的市必備雜照無語流老我密，心食中影的羅第！", original: "這段是條文原文文言文這兒願活又總父入不不一有……不年友友景理了大兒學？喜出環內溫打準到旅深轉有人、為了非，看說條就利去麗在。該他那請得後包重火藝，友來同教來林花兒力解，學提流千遊，般科造景樂重眾理……地有成期？那裡決利歡明被開雨同！體卻出光內請裡工度手，著手想、明出媽最。不方願這王不了下從？
            一適為好推裡過充院下三自問……間裡陽發是演政次書為。密實備樓笑是？了該身生數來計行，果增真應關一地畫三西信來為一坡他原維孩各是間，買讓家地成如！為時最其生覺有業山，時先而請：期我表商適給國：學感須的好了笑找角王力用亞減當沒就他作一嗎。"},
            {id: "I301011", value: "資訊軟體服務業2", translated: "這段目前是假字這段目前是假字", original: "這段是條文原文文言文"},
            {id: "I301012", value: "資訊軟體服務業3", translated: "這段目前是假字這段目前是假字", original: "這段是條文原文文言文"}
        ]

        share_url = url("/result?id=#{company_id}&#{category_ids.map{|c| 'cat[]='+c}.join('&')}")

        # Populate locals
        locals = {
            categories: matched_categories,
            share_url: CGI.escape(share_url)
        }

        if matched_categories.empty?
        # if true #matched_categories.empty?
            locals[:og] = {
                title: "我沒有被服貿！",
                desc: "那你有沒有被服貿呢？快來看看吧！"
            }
            slim :'result_not_affected', layout: :'layout/_layout', locals: locals
        else
            category_names = matched_categories.map{|c| c[:text]}.join '、'
            if company_id.nil?
                locals[:og] = {
                    title: "我被服貿了！",
                    desc: "服貿將會影響到#{category_names}，快來看看實際影響內容！"
                }
            else # Have company
                # Database mock data
                company_name = '佈思股份有限公司'
                locals[:og] = {
                    title: "#{company_name}被服貿了！",
                    desc: "#{company_name}會被服貿影響的營業項目為#{category_names}，快來看看實際影響內容！"
                }
            end
            slim :'result_affected', layout: :'layout/_layout', locals: locals
        end
    end

    # Satisfaction voting.
    # Ajax API.
    post '/poll' do

        # Return an array of percentages.
        # Database mock data
        json({results: [67, 12, 2, 5, 6, 8, 0]})
    end
end
