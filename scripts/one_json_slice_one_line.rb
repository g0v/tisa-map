#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "oj";
require "active_support/core_ext/hash/slice"

File.open(ARGV[0], "r").each_with_index do |line, index|
    line.sub!(/^(\d\d\d\d\d\d\d\d),/, "")
    number = $1
    line.sub!(/^{/, "{\"統編\": \"#{number}\" ,")
    json = Oj.load(line)
    puts json.slice("統編", "公司名稱", "公司狀況", "公司所在地", "所營事業資料")
end
