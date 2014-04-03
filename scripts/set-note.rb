#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

#
# Usage:
#
# From project redirectory,
#
# $ bundle exec ruby scripts/set-note.rb < path to utf-8 CSV file >
#
#

require 'yaml'
require 'csv'
require 'sequel'

CSV_FILENAME = ARGV[0]

# Connect to DB
DB = Sequel.connect(YAML.load_file("config/database.yml")[ENV['RACK_ENV'] || "development"])
DB.extension :pg_array, :pg_json, :pagination
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

# Load tisas
require_relative '../models/categories.rb'

# Space operations from 你會什麼就不能加個空白呢
# https://github.com/vinta/paranoid-auto-spacing/blob/master/src/pangu.js
#
def insert_space text
  text = text.gsub(/([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])(["'])/i, '\1 \2')
  text = text.gsub(/(["'])([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/i, '\1 \2')

  # 避免出現 '前面 " 字" 後面' 之類的不對稱的情況
  text = text.gsub(/(["']+)(\s*)(.+?)(\s*)(["']+)/i, '\1\3\5')

  # # 符號需要特別處理
  text = text.gsub(/([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])(#(\S+))/i, '\1 \2')
  text = text.gsub(/((\S+)#)([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/i, '\1 \3')

  # 前面<字>後面 --> 前面 <字> 後面
  old_text = text
  new_text = old_text.gsub(/([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([<\[\{\(]+(.*?)[>\]\}\)]+)([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/i, '\1 \2 \4')
  text = new_text
  if old_text == new_text
      # 前面<後面 --> 前面 < 後面
      text = text.gsub(/([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([<>\[\]\{\}\(\)])/i, '\1 \2')
      text = text.gsub(/([<>\[\]\{\}\(\)])([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/i, '\1 \2')
  end

  # 避免出現 "前面 [ 字] 後面" 之類的不對稱的情況
  text = text.gsub(/([<\[\{\(]+)(\s*)(.+?)(\s*)([>\]\}\)]+)/i, '\1\3\5')

  # 中文在前
  text = text.gsub(/([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])([a-z0-9`@&%=\$\^\*\-\+\|\/\\])/i, '\1 \2')

  # 中文在後
  text = text.gsub(/([a-z0-9`~!%&=;\|\,\.\:\?\$\^\*\-\+\/\\])([\u3040-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/i, '\1 \2')

  return text
end

# CSV
puts "Loading #{CSV_FILENAME}"
CSV.foreach(CSV_FILENAME) do |row|

  # Get first 4 elements from CSV row
  key, category_limit, note, open_limit = row

  if key && cat = Category.filter(key: key).first

    cat.note = {
      range:  insert_space((category_limit || '').gsub("\r", "\n")),
      text:   insert_space((note || '').gsub("\r", "\n")),
      limit:  insert_space((open_limit || '').gsub("\r", "\n"))
    }

    if cat.save
      puts "#{key} Done!"
    else
      puts "#{key} save error."
    end

  else
    puts "key #{key} not found"
  end
end
