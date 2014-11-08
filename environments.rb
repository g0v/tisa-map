# encoding: utf-8

require "bundler/setup"
require "sinatra/content_for"
require "slim"
require 'cgi'
Bundler.require :default

$:.unshift "lib"
require "hash/keys"

DB = Sequel.connect(YAML.load_file("config/database.yml")[ENV['RACK_ENV'] || "development"])
DB.extension :pg_array, :pg_json, :pagination
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
        def base_url
            @base_url ||= "#{request.scheme}://#{request.env['HTTP_HOST']}"
        end

        def like_url escape=false
            if escape
                CGI.unescape base_url
            else
                base_url
            end
        end

        def nl2br content
            content.gsub("\n",'<br>')
        end

        def strip_tags content
            content.gsub(%r{</?[^>]+>}, '')
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

    get "/category/:category" do # 所營事業項目
        page = params[:page].to_i > 0 ? params[:page].to_i : 1
        json Company.select(:name, :taxid) { ST_AsGeoJSON(location).as(location) }
                    .where("categories @> Array[?]::text[]", params[:category])
                    .paginate(page, 30)
                    .all
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

    # 「你被服貿了嗎」homepage.
    get "/" do

        # Nested templates: _layout > _query > index
        slim :'layout/_query', layout: :'layout/_layout' do
            slim :'index'
        end
    end

    # Text-matching companies' name, given token.
    def sort_by_position(results)
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

    def search_company(token)
        matcher = Regexp.new(Regexp.escape(token))
        result = Company.filter("name LIKE ? OR taxid = ?", "%#{token}%", token).order(:name).map do |i|
            {
                pos: [matcher =~ i.name, matcher =~ i.taxid].reject{|p|p.nil?}.min,
                value: i.name,
                id: i.taxid
            }
        end

        sort_by_position result
    end

    def search_category(token)
        result = Category.filter('name LIKE ?', "%#{token}%").order(:name).map do |i|
            {
                pos: Regexp.new(Regexp.escape(token)) =~ i.name,
                value: i.name,
                id: i.key
            }
        end

        sort_by_position result
    end

    # Display the search result for a specific keyword.
    get "/search" do
        redirect to('/') if params[:keyword].nil? or params[:keyword].empty?

        keyword = params[:keyword]

        companies = search_company(keyword)
        categories = search_category(keyword)

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
        return [].to_json if params[:term].empty?

        result = search_company(params[:term]).map{|c| c[:type]="公司行號"; c} +
                 search_category(params[:term]).map{|c| c[:type]="營業登記項目"; c}

        result.to_json
    end

    # Display the company's categories.
    get "/company/:tax_id" do

        company = Company.where(taxid: params[:tax_id]).first

        # TODO: Fix category name when categories table is populated
        categories = company.categories.map { |key|
            Category.where(key: key).first
        }.reject { |category|
            category.nil?
        }.map { |category|
            {
                id:     category.key,
                value:  category.name
            }
        }


        # If no category found for this company, redirect to result page immediately
        if categories.empty?
            return redirect to("/result?id=#{params[:tax_id]}")
        end

        slim :'layout/_query', layout: :'layout/_layout' do
            slim :'category', locals: {
                company: company,
                categories: categories
            }
        end
    end

    # Display the comparison result for a company ID or industry ID
    get "/result/?" do

        company = params[:id] ? Company.where(taxid: params[:id]).first : nil

        # The category keys the user chosen in previous steps.
        if params[:cat].is_a? Hash  # cat[0] = ...
            category_ids = params[:cat].values
        else                        # cat[] = ...
            category_ids = params[:cat] || []
        end

        matched_categories = []

        # Find all categories
        category_ids.each do |key|
          matched_categories += Category.where(key: key).to_a
        end

        matched_categories = matched_categories.reject { |category|
          category.nil?
        }.map { |category|
          articles = category.group.tisa.articles
          articles.symbolize_keys!
          articles[:original].symbolize_keys!
          articles[:translated].symbolize_keys!
          articles[:cpcs] = category.group.tisa.cpcs

          {
              id:     category.key,
              value:  category.name,
              note:   category.note.symbolize_keys!
          }.merge(articles)
        }

        if company.nil?
            share_url = base_url + "/result/?#{category_ids.map{|c| 'cat[]='+c}.join('&')}"
        else
            share_url = base_url + "/result/?id=#{company.taxid}&#{category_ids.map{|c| 'cat[]='+c}.join('&')}"
        end

        # Populate locals
        locals = {
            categories: matched_categories,
            share_url: share_url,
            company: company
        }

        if matched_categories.empty?
        # if true #matched_categories.empty?
            locals[:og] = {
                title: "我沒有被服貿！",
                desc: "那你有沒有被服貿呢？快來看看吧！"
            }
            slim :'result_not_affected', layout: :'layout/_layout', locals: locals
        else
            category_names = matched_categories.map{|c| c[:value]}.join '、'
            if company.nil?
                locals[:og] = {
                    title: "我被服貿了！",
                    desc: "服貿將會影響到#{category_names}，快來看看實際影響內容！"
                }
            else # Have company
                locals[:og] = {
                    title: "#{company.name}被服貿了！",
                    desc: "#{company.name}會被服貿影響的營業項目為#{category_names}，快來看看實際影響內容！"
                }
            end
            slim :'result_affected', layout: :'layout/_layout', locals: locals
        end
    end

    # The type parameter should be within range 0 to 6.
    POLL_TYPE_RANGE = (0..6)
    post '/poll' do
        type = params[:type].to_i
        halt 400 unless POLL_TYPE_RANGE.include? type

        Poll.create(type: type, ip: request.ip)
        json results: DB[:polls].select { [type, sum(1)] }.group(:type).where(:type => POLL_TYPE_RANGE).order(:type).map{|row| row[:sum]}
    end

    get '/tisa' do
      @tisas = Tisa.order(:id).all
      slim :tisa
    end
end
