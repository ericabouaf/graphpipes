class Node < ActiveRecord::Base
  
  belongs_to :pipe
  has_many :edges, :dependent => :destroy
  has_one :sub_pipe, :foreign_key => :id, :class_name => 'Pipe'
  
  validates_presence_of :kind
  validates_presence_of :x
  validates_presence_of :y  
    
  # node:
    # type
    # postition (array) x,y
    # content (hash) name*:value
  
end
