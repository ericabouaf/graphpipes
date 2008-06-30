class Pipe < ActiveRecord::Base
  belongs_to :user
  
  # def to_param
  #   "#{id}-#{title.downcase.gsub(/[^[:alnum:]]/,'-')}".gsub(/-{2,}/,'-')
  # end  
  
  validates_presence_of :title
  has_many :nodes, :dependent => :destroy
  has_many :edges, :dependent => :destroy
  belongs_to :node
  has_and_belongs_to_many :sources #, :dependent => :destroy

end
