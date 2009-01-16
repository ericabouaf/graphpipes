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

  def self.send_to_repository(query_string='')
    sesame = RubySesame::Server.new 'http://k-sems.uni-koblenz.de/openrdf-sesame', true, logger
    repo = sesame.repository 'k-sems'
    
    repo.query query_string, :method => 'post'
    
   
  end
end
