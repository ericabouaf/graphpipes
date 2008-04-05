class AddPipeToNode < ActiveRecord::Migration
  def self.up
    add_column :pipes, :node_id, :integer
  end

  def self.down
    remove_column :nodes, :pipe_id
  end
end
