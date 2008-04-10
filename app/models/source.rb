class Source < ActiveRecord::Base
  belongs_to :user
  has_and_belongs_to_many :pipes
  
  validates_presence_of :name
  # validates_presence_of :iri
   
end
