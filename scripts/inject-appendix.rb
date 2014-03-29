#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

#
# Usage:
#
# From project redirectory,
#
# $ bundle exec ruby scripts/inject-appendix.rb
#

require 'yaml'
require 'sequel'

# Connect to DB
DB = Sequel.connect(YAML.load_file("config/database.yml")[ENV['RACK_ENV'] || "development"])
DB.extension :pg_array, :pg_json, :pagination
Sequel::Model.plugin :json_serializer
Sequel::Plugins::JsonSerializer.configure(Sequel::Model, naked: true)

# Load tisas
require_relative '../models/tisas.rb'

# Read YAML
appendix_yaml = YAML.load File.read 'pod/appendix1.yaml'

Tisa.unrestrict_primary_key

appendix_yaml.each do |item|

  tisa = Tisa[item[:id]] || Tisa.new(id: item[:id])

  tisa.articles = {
    original:   Hash[item[:original].keys.zip(item[:original].values.map(&:strip))],
    translated: Hash[item[:translated].keys.zip(item[:translated].values.map(&:strip))]
  }

  if tisa.save
    puts "Saved #{item[:id]}"
  else
    puts "Not Saved #{item[:id]}"
  end
end
