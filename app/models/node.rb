class Node < ActiveRecord::Base
  
  belongs_to :pipe
  has_many :edges
  
  validates_presence_of :type
  validates_presence_of :postition
    
  # node:
    # type
    # postition (array) x,y
    # content (hash) name*:value
  
end
