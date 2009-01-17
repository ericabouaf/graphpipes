class Node < ActiveRecord::Base
  
  belongs_to :pipe
  
  has_many :terminals1, :class_name => 'Edge', :foreign_key => 'to_node'
  has_many :terminals2, :class_name => 'Edge', :foreign_key => 'from_node'
  
  # has_many :edges 
    
  has_one :sub_pipe, :foreign_key => :id, :class_name => 'Pipe'

  validates_presence_of :kind
  validates_presence_of :x
  validates_presence_of :y  

  serialize :content
  # node:
    # type
    # postition (array) x,y
    # content (hash) name*:value
  def edges
    terminals2 + terminals1
  end
  
  def inputs 
    edges.select do |edge|
      edge.src_node.inspect != self || edge.tgt_node.inspect != self      
    end
  end
  
  def outputs 
    edges.select do |edge|
      edge.src_node.inspect == self || edge.tgt_node.inspect == self                  
    end
  end
  
  def endpoint?
    element == 'node_last'
  end
  
  def has_children?
    inputs != []
  end
  
  def result
    element
  end
  
  def remember(data)
    self.content = data
    if save
      puts "#{id}: saved"
    else
      puts "#{id}: NOT saved"
    end
    puts errors.inspect
    puts Node.find(id).content
  end
end
