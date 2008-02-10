class UsersController < ApplicationController

  before_filter :login_required

  layout 'site'
  
    # render new.rhtml
  def new
    render :action => 'new', :layout => 'login'
  end

  def show
    @user = User.find_by_id(params[:id])
  end
  
  def edit
    @user = User.find_by_id(params[:id])
  end

  def update
    redirect_to user_path(current_user)
  end
  
  def create
    cookies.delete :auth_token

    @user = User.new(params[:user])
    @user.save
    if @user.errors.empty?
      self.current_user = @user
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!"
    else
      render :action => 'new', :layout => 'login'
    end
  end

  def activate
    self.current_user = params[:activation_code].blank? ? :false : User.find_by_activation_code(params[:activation_code])
    if logged_in? && !current_user.active?
      current_user.activate
      flash[:notice] = "Signup complete!"
    end
    redirect_back_or_default('/')
  end


  
  
  # def authorized
  #   @user = User.find_by_id(params[:id])    
  #   current_user == @user 
  #   false
  # end
     
    
end
