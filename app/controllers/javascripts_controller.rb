class JavascriptsController < ApplicationController

  before_filter :prepare_javascript_globals
  
  
  
  def stage
    @id = params[:pipe_id] || ''
  end

  private
  
  
  def prepare_javascript_globals
    @pipe_id = params[:pipe_id]
    @user_id = params[:user_id]
    @node_id = params[:node_id]
  end
end
