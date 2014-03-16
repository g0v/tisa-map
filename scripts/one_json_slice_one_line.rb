#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "oj";
require "active_support/core_ext/hash/slice"

File.open(ARGV[0], "r").each_with_index do |line, index|
    line.sub!(/^(\d\d\d\d\d\d\d\d),/, "")
    number = $1
    json = Oj.load(line).merge("taxid" => number)

    json["name"]      = json["公司名稱"]
    json["address"]   = json["公司所在地"]
    json["categoies"] = if json["所營事業資料"].is_a?(Array)
                          json["所營事業資料"].map { |item|
                            if item.is_a?(Array)
                              item[1]
                            elsif item.is_a?(String)
                              item
                            end
                          }
                        else
                          []
                        end
    json["status"]    = json["公司狀況"]
    json["owner"]     = json["代表人姓名"]

    puts Oj.dump(json.slice("taxid", "name", "status", "address", "categoies")) if json["name"]
end
