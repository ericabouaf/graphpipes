class PipesController < ResourceController::Base  
  before_filter :login_required
  
  layout 'site'
  
  def dashboard
    redirect_to user_pipes_path(current_user)
  end
  
  def show
    @pipe = Pipe.find :first, params[:id]
    render :action => 'show', :layout => 'stage'
  end
  
end
