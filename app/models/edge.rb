class Edge < ActiveRecord::Base
  
  # edge:
    # from (array) id, nodeid
    # to (array) id, nodeid

  belongs_to :pipe
  
  validates_presence_of :pipe_id
  validates_presence_of :from_node
  validates_presence_of :to_node
  validates_presence_of :from_terminal
  validates_presence_of :to_terminal
  
end
