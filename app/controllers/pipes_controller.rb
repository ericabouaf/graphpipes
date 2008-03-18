class PipesController < ApplicationController
  before_filter :login_required
  
  layout 'site'
  
  def dashboard
    redirect_to user_pipes_path(current_user)
  end
  
  def index
    
    raise ActiveRecord::RecordNotFound if User.find_by_id(params[:user_id]).nil?
    
    if (current_user.id = params[:user_id])
      @pipes = Pipe.find_all_by_user_id(params[:user_id] || current_user.id)
    else
      redirect_to user_pipes_path(current_user)
    end
  end
  
  def show
    @pipe = current_user.pipes.find_by_id params[:id]
    
    raise ActiveRecord::RecordNotFound if @pipe.nil?
  
    render :action => 'show', :layout => 'stage'
  end
  
  def edit
    @pipe = Pipe.find_by_id(params[:id])
  end
  
  def new
    @user = Pipe.new
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @user }
    end  
  end
  
  def create
    @pipe = Pipe.new params[:pipe].merge(:user_id => current_user.id)
    if @pipe.save
    
      respond_to do |format|
        format.html { redirect_to user_pipe_path(current_user, @pipe) }
      end
    else 
      respond_to do |format|
        format.html { render :action => 'new' }
      end
    end
  end
  
  def update
     @pipe = current_user.pipes.find(params[:id])
     
     raise ActiveRecord::RecordNotFound if @pipe.nil?
     
     debugger
     
     respond_to do |format|
       if @pipe.update_attributes(params[:pipe])
         flash[:notice] = 'The pipe was successfully updated.'
         format.html { redirect_to(edit_user_pipe_path(current_user, @pipe)) }
         format.xml  { head :ok }
       else
         format.html { render :action => "edit" }
         format.xml  { render :xml => @pipe.errors, :status => :unprocessable_entity }
       end
     end
   end
  
   def destroy
     @pipe = current_user.pipes.find_by_id(params[:id])
     
     raise ActiveRecord::RecordNotFound if @pipe.nil?
     
     @pipe.destroy

     flash[:notice] = "The pipe '#{@pipe.title}' was removed."

     respond_to do |format|
       format.html { redirect_to(user_pipes_path(current_user)) }
       format.xml  { head :ok }
     end
   end
  
end
