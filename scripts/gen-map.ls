# usage: lsc gen-map.ls  | topojson -p -o json_data/tisa-ly-map.json  /dev/stdin

list = <[江惠貞 盧嘉辰 李鴻鈞 李慶華 黃志雄 林鴻池 吳育昇 張慶忠 廖正井 顏寬恒 蔡錦隆 江啟臣 王惠美 林明溱 張嘉郡 翁重鈞 黃昭順 林國正 王進士]>

by-c = {}
seen = {}

require \./json_data/mly-8
.forEach ->
  c = it.constituency.join \-
  if it.name in list
    by-c[c] = it
    seen[it.name] = true

#console.error list.filter (!seen.)

topo = require \../twgeojson/twVote1982.topo.json

objs = topo.objects['twVote1982.geo']

objs.geometries .= filter ({properties}) ->
  return unless entry = by-c[properties<[county number]>.join(\-)]
  properties <<< entry
  true


console.log JSON.stringify topo
