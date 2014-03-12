require 'nokogiri'

levels = open('levels_draft.csv', 'w');
activities = open('activities.csv', 'w');
levelActivities = open('levelActivities.csv', 'w');
level4 = open('level4.csv', 'w');

open("detail.csv").each_line do |line|
  type_id=line.split("\t")[0]
  p type_id

  txt = open("17m/"+type_id+".htm").read
  doc = Nokogiri::XML(txt)

  result = []

  #levels
  rows = doc.css("values[ref='I-7-M-1'] row")
  ids = rows.map do |row|
    id = row.css("[ref='indid']").text
    name = row.css("[ref='indname']").text
    level = row.css("[ref='indlevel']").text

    levels.puts [level, id, name].join("\t")

    id
  end

  result = result.concat(ids)
  result.push rows[3].css("[ref='indname']").text

  result.push(doc.css("item[ref='inddesc']").text)

  #activities
  rows = doc.css("values[ref='I-7-M-5'] row")
  rows.each do |row|
    id = row.css("[ref='item1']").text
    name = row.css("[ref='itemname']").text

    activities.puts [id, name].join("\t")

    levelActivities.puts [type_id, id].join("\t")
  end

  level4.puts result.join("\t")
end