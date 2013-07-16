#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "oj"

File.open(ARGV[0], "r").each_with_index do |line, index|
    json = Oj.load(line)
    puts Oj.dump(json) if json["所營事業資料"].length <= 3
end
