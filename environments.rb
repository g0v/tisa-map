# encoding: utf-8

require "bundler/setup"
require "sinatra/content_for"
require "slim"
require 'cgi'
Bundler.require :default

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
        def like_url escape=false
            if escape
                CGI.unescape url("/")
            else
                url '/'
            end
        end

        def nl2br content
            content.gsub("\n",'<br>')
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
        matcher = Regexp.new(Regexp.escape(token))
        result = Company.filter("name LIKE ? OR taxid LIKE ?", "%#{token}%", "%#{token}%").order(:name).map do |i|
            {
                pos: [matcher =~ i.name, matcher =~ i.taxid].reject{|p|p.nil?}.min,
                value: i.name,
                id: i.taxid
            }
        end

        sort_by_position result
    end

    def search_category(token)
        result = Category.filter('name LIKE ? OR key LIKE ?', "%#{token}%", "%#{token}%").order(:name).map do |i|
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

        company = Company.where(taxid: params[:tax_id]).first

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

        company = params[:id] ? Company.where(taxid: params[:id]).first : nil

        # The category keys the user chosen in previous steps.
        category_ids = params[:cat]

        # The categories that are affected.
        # TODO: Query the matched category
        matched_categories = [
            {id: "I301010", value: "資訊軟體服務業", original: {
                service: '沒有限制。',
                consumer: '沒有限制。',
                business: '允許大陸服務提供者在臺灣以獨資、合資、合夥及設立分公司等形式設立商業據點，提 供電腦及其相關服務。',
                person: "除有關下列各類自然人之進入臺灣及短期停留措施外，不予承諾：
i. 商業訪客進入臺灣停留期間不得超過三個月。（商業訪客係指為參加商務會議、商務談判、籌建商業據點或其他類似活動，而在臺灣停留的自然人，且停留期間未接受來 自臺灣方面支付的酬勞，亦未對大眾從事 直接銷售的活動。）
ii. 跨國企業內部調動人員進入臺灣初次停留 期間為三年，惟可申請展延，每次不得逾 三年，且展延次數無限制。
（跨國企業內部調動人員係指被其他世界貿 易組織會員的法人僱用滿一年，透過在臺 灣設立的分公司、子公司或分支機構，以 負責人、高級經理人員或專家身分，短期 進入臺灣以提供服務的自然人。 「負責人」係指董事、總經理、分公司經
理或經董事會授權得代表公司的部門負責人。
「高級經理人員」係指有權任免或推薦公 司人員，且對日常業務有決策權的部門 負責人或管理人員。
「專家」係指組織內擁有先進的專業技術，且對該組織的服務、研發設備、技 術或管理擁有專門知識的人員。專家包 括，但不限於，取得專門職業證照者。）
iii.在臺灣無商業據點的大陸企業所僱用的人員得依下列條件進入臺灣及停留:
  （i） 該大陸企業已與在臺灣從事商業活動 的企業簽訂驗貨、售後服務、技術指導 等，及其他與左列服務相關的服務契 約。
  （ii） 此類人員應符合前述「專家」的定義。
  （iii）此類人員在臺灣期間不得從事其他與
  服務契約無關的服務活動。
  （iv）本項承諾僅限於契約所定的服務行
  為。並未給予此類人員以取得專業證照
  的身分，在臺灣廣泛執業的資格。 每次停留的期間不得超過三個月或契約 期間，以較短者為準。此類進入許可的有 效期間自核發的翌日起算為三個月至三 年。符合條件者可在許可有效期間內多次 進入臺灣。
    "
            }, translated: {
                service: '愛怎麼做都行。',
                consumer: '愛怎麼做都行。',
                business: '大陸服務商可以在台灣以獨資、合資、合夥與分公司形式成立服務據點。',
                person: "除有關下列各類自然人之進入臺灣及短期停留措施外，不予承諾：
i. 商業訪客進入臺灣停留期間不得超過三個月。（商業訪客係指為參加商務會議、商務談判、籌建商業據點或其他類似活動，而在臺灣停留的自然人，且停留期間未接受來 自臺灣方面支付的酬勞，亦未對大眾從事 直接銷售的活動。）
ii. 跨國企業內部調動人員進入臺灣初次停留 期間為三年，惟可申請展延，每次不得逾 三年，且展延次數無限制。
（跨國企業內部調動人員係指被其他世界貿 易組織會員的法人僱用滿一年，透過在臺 灣設立的分公司、子公司或分支機構，以 負責人、高級經理人員或專家身分，短期 進入臺灣以提供服務的自然人。 「負責人」係指董事、總經理、分公司經
理或經董事會授權得代表公司的部門負責人。
「高級經理人員」係指有權任免或推薦公 司人員，且對日常業務有決策權的部門 負責人或管理人員。
「專家」係指組織內擁有先進的專業技術，且對該組織的服務、研發設備、技 術或管理擁有專門知識的人員。專家包 括，但不限於，取得專門職業證照者。）
iii.在臺灣無商業據點的大陸企業所僱用的人員得依下列條件進入臺灣及停留:
  （i） 該大陸企業已與在臺灣從事商業活動 的企業簽訂驗貨、售後服務、技術指導 等，及其他與左列服務相關的服務契 約。
  （ii） 此類人員應符合前述「專家」的定義。
  （iii）此類人員在臺灣期間不得從事其他與
  服務契約無關的服務活動。
  （iv）本項承諾僅限於契約所定的服務行
  為。並未給予此類人員以取得專業證照
  的身分，在臺灣廣泛執業的資格。 每次停留的期間不得超過三個月或契約 期間，以較短者為準。此類進入許可的有 效期間自核發的翌日起算為三個月至三 年。符合條件者可在許可有效期間內多次 進入臺灣。
    "
            }},
            # Mockup for ID > 54
            {id: "I301011", value: "資訊軟體服務業2", original: {
                specific_commitments: "積極審慎修正有關大陸保險業在臺灣設立代表處及參股評等之規定。"
            },translated: {
                specific_commitments: "積極審慎修正有關大陸保險業在臺灣設立代表處及參股評等之規定。"
            }},

            # Mockup for ID == 24
            {id: "I301012", value: "電影或錄影帶之行銷服務業—進口大陸電影片", original: {
    service: "除與「其他承諾」有關者外，不予承諾。",
    consumer: "沒有限制。",
    business: "除與「其他承諾」有關者外，不予承諾。",
    person: "除與「其他承諾」有關者外，不予承諾。",
    other: "根據大陸有關規定設立的製片單位所拍攝、符合臺灣相關規定所定義之大陸電影片，經臺灣主管機關審查通過後，每年以15部為限，可在臺灣商業發行映演，並應符合大陸電影片進入臺灣發行映演之相關規定。"
            },translated: {
    service: "除與「其他承諾」有關者外，不予承諾。",
    consumer: "愛怎麼做都行。",
    business: "除與「其他承諾」有關者外，不予承諾。",
    person: "除與「其他承諾」有關者外，不予承諾。",
    other: "大陸電影片，在通過審查後，每年可以有15部影片在台灣上映。"
            }}
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

    # The type parameter should be within range 0 to 6.
    POLL_TYPE_RANGE = (0..6)
    post '/poll' do
        type = params[:type].to_i
        halt 400 unless POLL_TYPE_RANGE.include? type

        Poll.create(type: type, ip: request.ip)
        json results: DB[:polls].select { [type, sum(1)] }.group(:type).where(:type => POLL_TYPE_RANGE).order(:type).map{|row| row[:sum]}
    end
end
