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
    @pipe = current_user.pipes.find_by_id(params[:pipe_id])
    @node = Node.new params[:node].merge(:pipe_id => @pipe.id)
    
    sub_pipe_id = 0
    
    if @node.save    
      if @node.element == 'node_subgraph'
        @sub_pipe = current_user.pipes.create :title => "Sub_#{current_user.pipes.length + 1}", :short_description => 'Untitled.', :root => true
        sub_pipe_id = @sub_pipe.id
        if @sub_pipe.save
          @sub_pipe.nodes.create :kind => "nodeBox", :element => 'node_last', :x => 300, :y => 250, :has_pipe => false          
        end
      end
        
      respond_to do |format|
        format.html { redirect_to user_pipe_path(current_user, @pipe) }
        format.js { render :json => { :object => "node", 
                                      :node_id => @node.id, 
                                      :pipe_id => @pipe.id,                                       
                                      :user_id => current_user.id, 
                                      :sub_pipe_id => sub_pipe_id,                                     
                                      :success => true } }
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
    @pipe = current_user.pipes.find_by_id(params[:pipe_id])
    raise ActiveRecord::RecordNotFound if @pipe.nil?
    
    @node = @pipe.nodes.find_by_id params[:id]
    raise ActiveRecord::RecordNotFound if @node.nil?
        
    respond_to do |format|
      if @node.update_attributes(params[:node])
            flash[:notice] = 'The node was successfully updated.'
            format.html { redirect_to(edit_user_pipe_path(current_user, @pipe)) }
            format.js  { render :json => { :object => "node", 
                              :success => true} } 
          else
            format.html { render :action => "edit" }
            format.js { render :json => { :object => "node", 
                              :success => false,
                              :errorMessage => @node.errors }   }
            end
        end
   end
  
   def destroy
     @pipe = current_user.pipes.find_by_id(params[:pipe_id])
     raise ActiveRecord::RecordNotFound if @pipe.nil?

     @node = @pipe.nodes.find_by_id params[:id]
     raise ActiveRecord::RecordNotFound if @node.nil?
     
     @node.destroy

     flash[:notice] = "The node '#{@pipe.title}' was removed."

     respond_to do |format|
       format.html { redirect_to(user_pipes_path(current_user)) }
       format.js  { render :json => { :object => "node", 
                         :success => true} }
     end
   end
  
end
