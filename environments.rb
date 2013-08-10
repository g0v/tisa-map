require "bundler/setup"
Bundler.require :default

class App < Sinatra::Base

    get "/serial/:serial" do # 統一編號
    end

    post "/serial/:serial" do
    end

    put "/serial/:serial" do
    end

    get "/name/:name" do # 公司名稱
    end

    get "/business/:business" do # 所營事業項目
    end

    get "/center/:center/radius/:radius" do # 中心點 + 半徑
    end

end
