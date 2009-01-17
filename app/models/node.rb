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
  
  def to_sparql
    # Examples:
    
    # FILTER regex(?title, "web", "i" ) 
    # FILTER (?price < 30.5)
    
    node_result = case element
    when /construct/:
      puts content.inspect
      "CONSTRUCT { #{content['var_1']} #{content['verb']} #{content['var_2']} }"
    when /last/: 
      ''
    when /condition/:          
      'WHERE {' + content['var_1'] + ' ' + content['verb'] + ' ' + content['var_2'] + ' }'       
    when /filter/: 
     
      if content['kind'] == 'A Comparision'
        'FILTER (' + content['values'] + ')'
      else
        'FILTER ' + content['kind'] + '(' + content['values'] + ')'  
      end
    when /join/: 'join'
      ''
    when /repo/: 'resource'
      if !content.nil? && !content.blank?
        'FROM NAMED ' + content['iri']
      else 
        'FROM NAMED nothing'
      end  
    when /subgraph/: 
      Pipe.find(content['pipe_id']).to_sparql
    when /union/: 
      "{ #{content['var_1']} } UNION  { #{content['var_2']} }"
    else
      "ERROR: #{element}"
    end 
    puts "-- #{node_result}"
    node_result
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
