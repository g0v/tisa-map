#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "pg"
require "oj"
require "sequel"

::DB = Sequel.connect("postgres://tisa:tisa@192.168.1.163/test")

File.open(ARGV[0], "r").each_with_index do |line, index|
    json = Oj.load(line)
    puts json
    DB["insert into stores (name, address, taxid, business) values (?, ?, ?, ?)", json["公司名稱"], json["公司所在地"], json["統編"], json["所營事業資料"].to_s].insert
end
