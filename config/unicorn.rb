timeout 60
worker_processes 4
listen 3000
preload_app true
pid File.expand_path("../unicorn.pid", File.dirname(__FILE__))

before_fork do |server, worker|
    Signal.trap 'TERM' do
        puts 'Unicorn master intercepting TERM and sending myself QUIT instead'
        Process.kill 'QUIT', Process.pid
    end

    if defined?(Sequel::Model)
        Sequel::DATABASES.each{ |db| db.disconnect }
    end
end

after_fork do |server, worker|
    Signal.trap 'TERM' do
        puts 'Unicorn worker intercepting TERM and doing nothing. Wait for master to sent QUIT'
    end
end
