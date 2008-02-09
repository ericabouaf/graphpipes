class PipesController < ResourceController::Base  
  before_filter :login_required
  
  layout 'application'
  
  
  def dashboard
    redirect_to user_pipes_path(current_user)
  end
end
