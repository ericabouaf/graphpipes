class SiteController < ApplicationController

  
  def index  
    redirect_to user_pipes_path(current_user) if logged_in?
  end
  
  def imprint
  end
  
  def about
  end
  
  def internet_explorer
  end
end
