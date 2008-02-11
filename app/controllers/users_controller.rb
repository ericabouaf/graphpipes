class UsersController < ApplicationController

  before_filter :login_required, :except => ['new','create', 'activate']

  layout 'login'
  
  def index
    @users = User.find :all
  end
  
    # render new.rhtml
  def new
    @user = User.new
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @dummy }
    end  
  end
  
  def show
    @user = User.find_by_id(params[:id])
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @user }
    end    
  end
  
  def edit
    @user = User.find_by_id(params[:id])
  end

  def update
     @user = User.find(params[:id])

     respond_to do |format|
       if @user.update_attributes(params[:dummy])
         flash[:notice] = 'The useraccount was successfully updated.'
         format.html { redirect_to(users_path) }
         format.xml  { head :ok }
       else
         format.html { render :action => "edit" }
         format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
       end
     end
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


  
  
  def authorized
    @user = User.find_by_id(params[:id])    
    current_user == @user 
    false
  end
     
    
end
