class PipesController < ResourceController::Base  
  before_filter :login_required
end
