class CreateEdges < ActiveRecord::Migration
  def self.up
    create_table :edges do |t|
      t.integer :node_id
      
      t.integer :from_node
      t.integer :to_node
      
      t.integer :from_terminal
      t.integer :to_terminal
      t.timestamps
    end
  end

  def self.down
    drop_table :edges
  end
end
