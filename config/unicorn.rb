timeout 60
worker_processes 4
listen 3000
pid File.expand_path("../unicorn.pid", File.dirname(__FILE__))
