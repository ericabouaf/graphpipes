class AddNodeRoot < ActiveRecord::Migration
  def self.up
    add_column :pipes, :root, :boolean, :default => 0
    
    Pipe.find(:all).each do |pipe|
      pipe.root = false
      pipe.save
    end
  end

  def self.down
    remove_column :pipes, :root
  end
end
