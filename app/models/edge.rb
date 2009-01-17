class Edge < ActiveRecord::Base
  
  # edge:
    # from (array) id, nodeid
    # to (array) id, nodeid

  belongs_to :pipe
  
  belongs_to :src_node, :foreign_key => "from_node", :class_name => "Node"
  belongs_to :tgt_node, :foreign_key => "to_node", :class_name => "Node"

  validates_presence_of :pipe_id
  validates_presence_of :from_node
  validates_presence_of :to_node
  validates_presence_of :from_terminal
  validates_presence_of :to_terminal
  
  def other_node(node)
    src_node == node ? tgt_node : src_node
  end
end
