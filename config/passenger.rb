
# passenger-based overrides of the default tasks


namespace :deploy do
  namespace :passenger do
    [ :stop, :start, :restart ].each do |t|
      desc "#{t.to_s.capitalize} the mongrel appserver"
      task t, :roles => :app do
        run "touch #{current_path}/tmp/restart.txt"
      end
    end
  end

  desc "Custom restart task for mongrel cluster"
  task :restart, :roles => :app, :except => { :no_release => true } do
    deploy.passenger.restart
  end

  desc "Custom start task for mongrel cluster"
  task :start, :roles => :app do
    deploy.passenger.start
  end

  desc "Custom stop task for mongrel cluster"
  task :stop, :roles => :app do
    deploy.passenger.stop
  end

end


