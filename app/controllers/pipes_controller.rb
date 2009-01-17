require 'rubygems'
#require 'rest_client'
require 'hpricot'
require 'digest/sha1'

class PipesController < ApplicationController
  before_filter :login_required
  
  layout 'site'
  
  def dashboard
    redirect_to user_pipes_path(current_user)
  end
  
    
  def save
    JSON.load(params["query"]).each do |h|
      Node.find(h['id']).remember(h['fields'])
    end
    
    respond_to do |format|
      format.js {
        render :json => {:params => params.to_json, :success => true}      
      }
    end
  end
  
  
  def query 
    # save data
    # todo: clean up => save is doing the same    
    JSON.load(params["save"]).each do |h|
      Node.find(h['id']).remember(h['fields'])
    end
     @pipe = Pipe.find(params[:id])    
     query = @pipe.to_sparql
     
     respond_to do |format|
       format.js {
         render :json => {:query => query.to_json, :success => true}
       }
     end
  end
  
  def run     
    # save data
    # todo: clean up => save is doing the same
    JSON.load(params["save"]).each do |h|
      Node.find(h['id']).remember(h['fields'])
    end    
        
    @pipe = Pipe.find(params[:id])    
    query = @pipe.to_sparql
  
    success = true
    
    begin
      result = Pipe.send_to_repository query
    rescue RubySesame::SesameException => e
      success = false
      result = e.body      
    end

    file_name = Digest::SHA1.hexdigest(query)    
    File.open("#{RAILS_ROOT}/public/responses/#{file_name}.result.txt", 'w') {|f| f.write(result) }
    File.open("#{RAILS_ROOT}/public/responses/#{file_name}.query.txt", 'w') {|f| f.write(URI.unescape query) }

    respond_to do |format|
      format.js { 
        render :json => { :object => "session", 
                          :success => success,
                          :query => query,
                          :result => result,
                          :query_path => "/responses/#{file_name}.query.txt",
                          :file_name => file_name,
                          :path => "/responses/#{file_name}.result.txt" } 
      }
    
    end
  end
  
  def index
    raise ActiveRecord::RecordNotFound if User.find_by_id(params[:user_id]).nil?
    
    if (current_user.id = params[:user_id])
      @pipes = Pipe.find_all_by_user_id(params[:user_id] || current_user.id, :conditions => {:root => true})
    else
      redirect_to user_pipes_path(current_user)
    end
  end
  
  def show
    @parent_pipes = find_parental_pipe
    @pipe = current_user.pipes.find_by_id params[:id]
    
    raise ActiveRecord::RecordNotFound if @pipe.nil?
  
    render :action => 'show', :layout => 'stage'
  end
  
  def edit
    @pipe = Pipe.find_by_id(params[:id])
  end
  
  def new
    @pipe = Pipe.new
    @pipe.root = 't'
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @pipe }
    end  
  end
  
  def create
    @pipe = Pipe.new params[:pipe].merge(:user_id => current_user.id)
        
    if @pipe.save
      @pipe.nodes.create :kind => "nodeBox", :element => 'node_last', :x => 300, :y => 250, :content => 'Terminal Box', :has_pipe => false
      
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
  
  protected

  def find_parental_pipe
    return nil if params[:parent].nil?
    current_user.pipes.find_all_by_id(params[:parent])
  end
end
