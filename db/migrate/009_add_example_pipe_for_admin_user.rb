class AddExamplePipeForAdminUser < ActiveRecord::Migration
  def self.up
    
    user = User.find_by_login 'admin'
    
    pipe = user.pipes.create :title => "My first pipe", :short_description => 'This is a prebuild demonstration.', :root => true
    public_sub_pipe = user.pipes.create :title => "Another pipe", :short_description => 'And another one.', :root => true
    hidden_sub_pipe = user.pipes.create :title => "Hidden pipe", :short_description => 'you wont see this.', :root => false      

    # pipe 1
    pipe.nodes.create :kind => "jsBox", :x => 100, :y => 250, :content => 'example box 1', :has_pipe => public_sub_pipe.id
    pipe.nodes.create :kind => "jsBox", :x => 300, :y => 250, :content => 'example box 2', :has_pipe => hidden_sub_pipe.id
    pipe.nodes.create :kind => "jsBox", :x => 200, :y => 450, :content => 'example box 3'
    
    pipe.edges.create :from_node => 1, :to_node => 2, :from_terminal => 1, :to_terminal => 0
    pipe.edges.create :from_node => 0, :to_node => 2, :from_terminal => 1, :to_terminal => 0
    pipe.edges.create :from_node => 2, :to_node => 3, :from_terminal => 1, :to_terminal => 0    

    # pipe 2
    public_sub_pipe.nodes.create :kind => "jsBox", :x => 100, :y => 250, :content => 'sub node 1', :has_pipe => hidden_sub_pipe.id    
    public_sub_pipe.nodes.create :kind => "jsBox", :x => 200, :y => 450, :content => 'sub node 2' 
    
    public_sub_pipe.edges.create :from_node => 0, :to_node => 1, :from_terminal => 1, :to_terminal => 0    
    public_sub_pipe.edges.create :from_node => 1, :to_node => 2, :from_terminal => 1, :to_terminal => 0        

    # pipe 3
    hidden_sub_pipe.nodes.create :kind => "jsBox", :x => 100, :y => 250, :content => 'sub node 1' 
    
    hidden_sub_pipe.edges.create :from_node => 0, :to_node => 1, :from_terminal => 1, :to_terminal => 0    
  end

  def self.down
  end
end
