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
        def like_url escape=false
            if escape
                CGI.unescape url("/")
            else
                url '/'
            end
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
        result = Company.filter("name LIKE ? OR taxid LIKE ?", "%#{token}%", "%#{token}%").order(:name).map do |i|
            {
                pos: Regexp.new(Regexp.escape(token)) =~ i.name,
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
        result = search_company(params[:term]).map{|c| c[:type]="公司行號"; c} +
                 search_category(params[:term]).map{|c| c[:type]="營業登記項目"; c}

        result.to_json
    end

    # Display the company's categories.
    get "/company/:tax_id" do

        company = Company.filter(taxid: params[:tax_id]).first

        # TODO: Fix category name when categories table is populated
        categories = company.categories.map do |c|
            {
                id: c,
                value: '' # TODO: put the category name here
            }
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

        company = params[:id] ? Company.filter(taxid: params[:id]).first : nil

        # The category keys the user chosen in previous steps.
        category_ids = params[:cat]

        # The categories that are affected.
        # TODO: Query the matched category
        matched_categories = [
            {id: "I301010", value: "資訊軟體服務業", translated: "", original: "原文"},
            {id: "I301011", value: "資訊軟體服務業2", translated: "", original: "這段是條文原文文言文"},
            {id: "I301012", value: "資訊軟體服務業3", translated: "", original: "這段是條文原文文言文"}
        ]

        if company.nil?
            share_url = url("/result?#{category_ids.map{|c| 'cat[]='+c}.join('&')}")
        else
            share_url = url("/result?id=#{company.taxid}&#{category_ids.map{|c| 'cat[]='+c}.join('&')}")
        end

        # Populate locals
        locals = {
            categories: matched_categories,
            share_url: CGI.escape(share_url),
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
            category_names = matched_categories.map{|c| c[:text]}.join '、'
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

    post '/poll' do
        Poll.create(type: params[:type], ip: request.ip)
        json(results: DB[:polls].select { [type, sum(1)] }.group(:type).order(:type).map { |row| row[:sum] })
    end
end
