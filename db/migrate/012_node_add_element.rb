class NodeAddElement < ActiveRecord::Migration
  def self.up
    add_column :nodes, :element, :string
  end

  def self.down
    remove_column :nodes, :element    
  end
end
