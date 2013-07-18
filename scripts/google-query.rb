#!/usr/bin/env ruby
# -*- coding: UTF-8 -*-

require "pp"
require "oj"
require "rest_client"

def location(address)
    response = Oj.load(RestClient.get(
        "http://maps.googleapis.com/maps/api/geocode/json",
        :params => { :address => address, :sensor => "false" }
    ))
    if response["status"] == "OK"
        return response["results"][0]["geometry"]["location"]
    else
        return {}
    end
end

source = File.open(ARGV[0], "r")
output = File.open("#{source.path}.location", "w")

source.each_with_index do |line, index|
    json = Oj.load(line)
    location = location(json["公司所在地"]).merge({"number" => json["統編"]})
    puts Oj.dump(location)
    output.write(Oj.dump(location))
    output.write("\n")
    sleep 3
end

