class EdgesController < ApplicationController
  before_filter :login_required
  
  layout 'site'
    
  def show
    @pipe = current_user.pipe.find_by_id(params[:pipe_id])
    @edge = @pipe.edges.find_by_id params[:id]
    
    raise ActiveRecord::RecordNotFound if @edge.nil?
  
    render :action => 'show', :layout => 'stage'
  end
  
  def create
    debugger
    @pipe = current_user.pipes.find_by_id(params[:pipe_id])
    raise ActiveRecord::RecordNotFound if @pipe.nil?

    debugger
    @edge = Edge.new params[:edge]# .merge(:pipe_id => @pipe.id)

    if @edge.save    
      respond_to do |format|
        format.html { redirect_to user_pipe_path(current_user, @pipe) }
        format.js { render :json => { :object => "edge", 
                                      :edge_id => @edge.id, 
                                      :pipe_id => @pipe.id,                                       
                                      :user_id => current_user.id,                                       
                                      :success => true } }
      end
    else 
      respond_to do |format|
        format.html { render :action => 'new' }
        format.js { render :json => { :object => "edge", 
                          :success => false,
                          :errorMessage => @edge.errors }   }
      end
    end
  end
  
  def update
    @pipe = current_user.pipe.find_by_id(params[:pipe_id])
    raise ActiveRecord::RecordNotFound if @pipe.nil?

    @edge = @pipe.edges.find_by_id params[:id]
    raise ActiveRecord::RecordNotFound if @edge.nil?
     
     respond_to do |format|
       if @edge.update_attributes(params[:pipe])
         flash[:notice] = 'The pipe was successfully updated.'
         format.html { redirect_to(edit_user_pipe_path(current_user, @pipe)) }
         format.xml  { head :ok }
       else
         format.html { render :action => "edit" }
         format.xml  { render :xml => @edge.errors, :status => :unprocessable_entity }
       end
     end
   end
  
   def destroy
     @pipe = current_user.pipe.find_by_id(params[:pipe_id])
     raise ActiveRecord::RecordNotFound if @pipe.nil?

     @edge = @pipe.edges.find_by_id params[:id]
     raise ActiveRecord::RecordNotFound if @edge.nil?
     
     @edge.destroy

     flash[:notice] = "The edge '#{@pipe.title}' was removed."

     respond_to do |format|
       format.html { redirect_to(user_pipes_path(current_user)) }
       format.xml  { head :ok }
     end
   end
  
end
