#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require 'json'
require 'yaml'

def minify_json(data)
   JSON.parse(data).to_json
end

source = File.open(ARGV[0], "r")
output_filename = source.path.gsub('.yaml', '')
output = File.open("#{output_filename}.json", "w")
data = YAML::load(source)
json = JSON.dump(data)
json_without_whitespace = {}
result = []

JSON.parse(json).each do |d|
  json_without_whitespace = {:id => d['id']}
  unless d['service'].nil?
    json_without_whitespace['service'] = d['service'].delete(' ')
  end
  unless d['consumer'].nil?
    json_without_whitespace['consumer'] = d['consumer'].delete(' ')
  end
  unless d['business'].nil?
    json_without_whitespace['business'] = d['business'].delete(' ')
  end
  unless d['person'].nil?
    json_without_whitespace['person'] = d['person'].delete(' ')
  end
  unless d['specific_commitments'].nil?
    json_without_whitespace['specific_commitments'] = d['specific_commitments'].delete(' ')
  end
  result << json_without_whitespace
end

puts result
output.write(result.to_json)
