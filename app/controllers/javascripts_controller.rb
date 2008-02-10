class JavascriptsController < ApplicationController
  
  def login
    respond_to do |wants|
      wants.js
    end
  end
  
end
