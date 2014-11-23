require_relative "../environments.rb"

sql = Zlib::GzipReader.open(
    File.join(File.dirname(__FILE__),"../pod/standards_new.sql.gz")
).read

DB.run sql
