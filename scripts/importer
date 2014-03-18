#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "oj";
require "active_support/core_ext/hash/slice"
require "pg"
require "sequel"

::DB = Sequel.connect("postgres://tisa:tisamap@localhost/tisa")
DB.extension :pg_array

class Company < Sequel::Model
end

File.open(ARGV[0], "r").each_with_index do |line, index|
    line.sub!(/^(\d\d\d\d\d\d\d\d),/, "")
    number = $1
    json = Oj.load(line).merge("taxid" => number)

    json["name"]      = if json["公司名稱"].is_a?(String)
                          json["公司名稱"]
                        elsif json["公司名稱"].is_a?(Array)
                          json["公司名稱"][0]
                        else
                          json["公司名稱"].to_s
                        end

    json["address"]   = json["公司所在地"]
    json["categoies"] = if json["所營事業資料"].is_a?(Array)
                          json["所營事業資料"].map { |item|
                            if item.is_a?(Array)
                              item[1]
                            elsif item.is_a?(String)
                              item
                            end
                          }.pg_array
                        else
                          [].pg_array
                        end
    json["status"]    = json["公司狀況"]
    json["owner"]     = json["代表人姓名"]

    if json["name"]
      company = Company.new(json.slice("taxid", "name", "address", "categoies", "status", "owner")).save
      puts company.taxid
    # puts Oj.dump(json.slice("taxid", "name", "status", "address", "categoies"))
    end

end
