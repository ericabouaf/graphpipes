# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time

  include AuthenticatedSystem

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  #protect_from_forgery # :secret => '95f6fe8da4fa969a7cdf9f0acbdfe597'
  #self.allow_forgery_protection = false
  
  #before_filter :reject_ie
  
  
  protected
  
  def reject_ie
    redirect_to site_path(:action => 'internet_explorer') if explorer?
  end
  
  
  def explorer?  
    request.user_agent.include?('Explorer')  
  end
end
