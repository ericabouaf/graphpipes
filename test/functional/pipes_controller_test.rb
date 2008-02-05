require File.dirname(__FILE__) + '/../test_helper'
require 'pipes_controller'

# Re-raise errors caught by the controller.
class PipesController; def rescue_action(e) raise e end; end

class PipesControllerTest < Test::Unit::TestCase
  fixtures :pipes

  def setup
    @controller = PipesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:pipes)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_pipe
    old_count = Pipe.count
    post :create, :pipe => { }
    assert_equal old_count+1, Pipe.count
    
    assert_redirected_to pipe_path(assigns(:pipe))
  end

  def test_should_show_pipe
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_pipe
    put :update, :id => 1, :pipe => { }
    assert_redirected_to pipe_path(assigns(:pipe))
  end
  
  def test_should_destroy_pipe
    old_count = Pipe.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Pipe.count
    
    assert_redirected_to pipes_path
  end
end
