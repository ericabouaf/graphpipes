class JavascriptsController < ApplicationController

  def stage
    @id = params[:pipe_id] || ''
  end
  
end
