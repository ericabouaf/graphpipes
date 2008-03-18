class Edge < ActiveRecord::Base
  
  # edge:
    # from (array) id, nodeid
    # to (array) id, nodeid
  
  belongs_to :node

end
