class AddExamplePipeForAdminUser < ActiveRecord::Migration
  def self.up
    
    user = User.find_by_login 'admin'
    
    pipe = user.pipes.create :title => "My first pipe", :short_description => 'This is a prebuild demonstration.', :root => true
    public_sub_pipe = user.pipes.create :title => "Another pipe", :short_description => 'And another one.', :root => true
    hidden_sub_pipe = user.pipes.create :title => "Hidden pipe", :short_description => 'you wont see this.', :root => false      

    # pipe 1
    one = pipe.nodes.create :kind => "nodeBox", :element => "node_repo", :x => 100, :y => 250, :content => 'example box 1'
    # pipe.nodes.create :kind => "nodeBox", :element => "node_condition", :x => 320, :y => 250, :content => 'example box 2'
    # pipe.nodes.create :kind => "nodeBox", :x => 200, :y => 450, :content => 'subgraph box 1', :has_pipe => public_sub_pipe.id
    # pipe.nodes.create :kind => "nodeBox", :x => 550, :y => 200, :content => 'example box 2', :has_pipe => hidden_sub_pipe.id
    two = pipe.nodes.create :kind => "nodeBox", :element => "node_last", :x => 500, :y => 500, :content => 'Terminal Box', :has_pipe => false    
     
    # pipe.edges.create :from_node => 1, :to_node => 2, :from_terminal => 0, :to_terminal => 3
        
    # pipe 2
    # public_sub_pipe.nodes.create :kind => "nodeBox", :element => "node_repo", :x => 100, :y => 250, :content => 'example box 1'
    # public_sub_pipe.nodes.create :kind => "nodeBox", :x => 500, :y => 500, :content => 'Terminal Box', :has_pipe => false    
  
  end

  def self.down
  end
end
