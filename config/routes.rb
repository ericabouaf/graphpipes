ActionController::Routing::Routes.draw do |map|

  map.root :controller => 'site', :action => 'index'

  # map.resources :users, :has_many => :pipes
  map.resources :users do |user|
    user.resources :pipes do |node|
      node.resources :nodes
      node.resources :edges      
    end
    user.resources :sources
  end
  
  map.resource :sessions

  # map.resources :pipes

  map.signup '/signup', :controller => 'users', :action => 'new'
  map.login  '/login', :controller => 'sessions', :action => 'new'
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  
  # map.logout '/dashboard', :controller => 'pipes', :action => "dashboard"
  
  map.site '/:action', :controller => 'site'
  map.javascript '/javascripts/:action.:format', :controller => 'javascripts' 
  
  # map.connect ':controller/:action/:id'
  # map.connect ':controller/:action.:format'  
  # 
  # map.connect ':controller/:action/:id.:format'
end
