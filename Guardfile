# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'livereload' do
  watch(%r{views/.+\.(erb|haml|slim)$})
  watch(%r{public/img/.+})
  watch(%r{assets/.+})
  # Rails Assets Pipeline
  # watch(%r{(app|vendor)(/assets/\w+/(.+\.(css|js|html))).*}) { |m| "/assets/#{m[3]}" }
end

# Add files and commands to this file, like the example:
#   watch(%r{file/path}) { `command(s)` }
#
# guard 'shell' do
#   watch(/(.*).txt/) {|m| `tail #{m[0]}` }
# end
