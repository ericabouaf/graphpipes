class AddHasPipeToNode < ActiveRecord::Migration
  def self.up
    add_column :nodes, :has_pipe, :integer
  end

  def self.down
    remove_column :nodes, :has_pipe
  end
end
