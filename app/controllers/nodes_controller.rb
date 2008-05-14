class NodesController < ApplicationController
  before_filter :login_required
  
  layout 'site'
    
  def show
    @pipe = current_user.pipes.find_by_id(params[:pipe_id])
    
    raise ActiveRecord::RecordNotFound if @pipe.nil?  
  
    @node = @pipe.nodes.find_by_id params[:id]
    
    raise ActiveRecord::RecordNotFound if @node.nil? || @pipe.nil?
    
    respond_to do |format|  
      format.html { redirect_to user_pipe_path(current_user, @node.sub_pipe.id, :parent => @pipe.id)     }      
      format.xml  { head :ok }
    end
    
    # render user_pipe_path(current_user, @node.sub_pipe.id, :parent => @pipe.id)
    # redirect_to user_pipe_path(current_user, @node.sub_pipe.id, :parent => @pipe.id)    
  end
  
  def create
    debugger
    @pipe = current_user.pipes.find_by_id(params[:pipe_id])
    @node = Node.new params[:node].merge(:pipe_id => @pipe.id)

    if @node.save    
      respond_to do |format|
        format.html { redirect_to user_pipe_path(current_user, @pipe) }
        format.js { render :json => { :object => "node", :success => true } }
      end
    else 
      respond_to do |format|
        format.html { render :action => 'new' }
        format.js { render :json => { :object => "node", 
                          :success => false,
                          :errorMessage => @node.errors }   }     
      end
    end
  end
  
  def update
    respond_to do |format|
      format.xml  { head :ok }    
    end
    # @pipe = current_user.pipe.find_by_id(params[:pipe_id])
    #    raise ActiveRecord::RecordNotFound if @pipe.nil?
    # 
    #    @node = @pipe.nodes.find_by_id params[:id]
    #    raise ActiveRecord::RecordNotFound if @node.nil?
    #     
    #     respond_to do |format|
    #       if @node.update_attributes(params[:pipe])
    #         flash[:notice] = 'The pipe was successfully updated.'
    #         format.html { redirect_to(edit_user_pipe_path(current_user, @pipe)) }
    #         format.xml  { head :ok }
    #       else
    #         format.html { render :action => "edit" }
    #         format.xml  { render :xml => @node.errors, :status => :unprocessable_entity }
    #       end
    #     end
   end
  
   def destroy
     @pipe = current_user.pipe.find_by_id(params[:pipe_id])
     raise ActiveRecord::RecordNotFound if @pipe.nil?

     @node = @pipe.nodes.find_by_id params[:id]
     raise ActiveRecord::RecordNotFound if @node.nil?
     
     @node.destroy

     flash[:notice] = "The node '#{@pipe.title}' was removed."

     respond_to do |format|
       format.html { redirect_to(user_pipes_path(current_user)) }
       format.xml  { head :ok }
     end
   end
  
end
