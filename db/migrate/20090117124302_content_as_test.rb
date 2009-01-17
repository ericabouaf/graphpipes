class ContentAsTest < ActiveRecord::Migration
  def self.up
    remove_column :nodes, :content 
    add_column :nodes, :content, :text       
  end

  def self.down
    remove_column :nodes, :content 
    add_column :nodes, :content, :string    
  end
end

