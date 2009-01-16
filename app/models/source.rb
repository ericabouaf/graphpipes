

class Source < ActiveRecord::Base
  belongs_to :user
  has_and_belongs_to_many :pipes
  
  validates_presence_of :name
  validates_presence_of :iri
   
   
  def upload_to_sesame
    sesame = RubySesame::Server.new 'http://k-sems.uni-koblenz.de/openrdf-sesame', true, logger
    repo = sesame.repository 'k-sems'
    
    # write file
    open("#{RAILS_ROOT}/public/rdf/#{name}","w").write(open(iri).read) 

    r = repo.add! open("#{RAILS_ROOT}/public/rdf/#{name}","w")
   end
end
