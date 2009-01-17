class Pipe < ActiveRecord::Base
  attr_reader :visited_nodes
  
  belongs_to :user
  
  has_many :nodes, :dependent => :destroy
  has_many :edges, :dependent => :destroy
  belongs_to :node
  has_and_belongs_to_many :sources #, :dependent => :destroy

  validates_presence_of :title

  def self.send_to_repository(query_string='')
    sesame = RubySesame::Server.new 'http://k-sems.uni-koblenz.de/openrdf-sesame', true, logger
    repo = sesame.repository 'k-sems'
    
    repo.query query_string, :method => 'post'
  end
  
  def to_sexp
    @visited_nodes = []
    all = build_tree_from(endpoint)
  end
  
  def to_sparql 
    #  alles nodes evaluieren,
    # subpipes -> subpipe.to_sparql
    to_sexp.each do |node|
      node.result
    end
    
    'SELECT ?title
    WHERE
    {
      <http://example.org/book/book1> <http://purl.org/dc/elements/1.1/title> ?title .
    }'
  end
  
  def build_tree_from(node)    
    return if @visited_nodes.include?(node)      

    @visited_nodes << node        
    tree = []
    
    if node.has_children?  
      node.inputs.each do |edge|                  
        tree << build_tree_from(edge.tgt_node) unless @visited_nodes.include? edge.tgt_node
        tree << build_tree_from(edge.src_node) unless @visited_nodes.include? edge.src_node
      end    
      tree << node
    else 
      tree
    end
  end
  
  
  def endpoint
    nodes.select {|n| n.endpoint? }.first
  end
  
  
  def has_a_construct_node?
    nodes.detect { |n| n.element == 'node_construct'} ? true : false
  end
  
  def networked_graph?
    has_a_construct_node? && construct_node_is_connected?
  end

  def construct_node_is_connected?
   true
 end
end

