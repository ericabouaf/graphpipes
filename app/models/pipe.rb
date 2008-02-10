class Pipe < ActiveRecord::Base
  belongs_to :user
  
  def to_param
    "#{id}-#{title.downcase.gsub(/[^[:alnum:]]/,'-')}".gsub(/-{2,}/,'-')
  end  
end
