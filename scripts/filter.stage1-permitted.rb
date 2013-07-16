#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "oj"
require "active_support/core_ext/hash/slice"

File.open(ARGV[0], "r").each_with_index do |line, index|
    json = Oj.load(line)
    puts Oj.dump(json.slice("統編", "公司名稱", "公司所在地", "所營事業資料")) if json["公司狀況"]=="核准設立"
end
