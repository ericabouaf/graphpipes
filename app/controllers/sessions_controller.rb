require 'pp'

class SessionsController < ApplicationController

  layout 'login'

  def new
  end

  def create

    login_params = params['session'] || params
  
    
    
    self.current_user = User.authenticate(login_params['login'], login_params['password'])
    
    puts pp params
    
    if logged_in?
      save_cookie if params[:remember_me] == "1"      
     
      respond_to do |format|
        format.html do 
          flash[:notice] = "Logged in successfully"          
          redirect_back_or_default(user_pipes_path(current_user)) 
        end
        format.js { render :update do |page| page.redirect_to user_pipes_path(current_user); end }
      end
    else      
      error_message = 'That login and password could not be found.'
      
      respond_to do |format|
        format.js { render :json => {
          :object => "session", 
          :success => false, 
          :error_message => error_message } }
        format.html {
          flash[:error] = error_message              
          redirect_to :action => 'new'
        }
      end      
      
    end
  end

  def destroy
    delete_cookie
    flash[:notice] = "You have been logged out."
    redirect_back_or_default('/')
  end
  
  protected
  
  def save_cookie
    self.current_user.remember_me
    cookies[:auth_token] = { :value => self.current_user.remember_token , :expires => self.current_user.remember_token_expires_at }    
  end
  
  def delete_cookie
    self.current_user.forget_me if logged_in?
    cookies.delete :auth_token
    reset_session    
  end
end
