#!/usr/bin/env ruby

require "pg"
require "sequel"
require "oj"

::DB = Sequel.connect("postgres://tisa:tisamap@localhost/tisa")

source = File.open(ARGV[0], "r")

source.each_with_index do |line, index|
    json = Oj.load(line)
    point = Oj.dump({
        "type"        => "Point",
        "coordinates" => [json["lng"].to_f, json["lat"].to_f],
    })
    if (json["lng"] and json["lat"])
        puts json["number"], point
        DB["update companies set location = ST_SetSRID(ST_GeomFromGeoJSON(?),4326) where taxid = ?;", point, json["number"]].update
    end
   #puts DB["select * from stores where taxid = ?;", json["number"]].first[:name]
   #puts Oj.dump RGeo::GeoJSON.encode(RGeo::GeoJSON.decode(point))
end
