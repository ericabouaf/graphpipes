class AnalyticsWorker < Workling::Base
  def potential_invited(options)
    #Hit.create :potential_user_id => options[:potential_user_id], :action => "invited" 
  end  
  
  def potential_converted(options)
    #Hit.create :potential_user_id => options[:potential_user_id], :action => "converted" 
  end
  
  def search(options)
    #results = Blackbook.get(options[:key], options[:username], options[:password])
    results = '123'
    Workling::Return.set(options[:uid], results)
  end
end