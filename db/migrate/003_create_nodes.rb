class CreateNodes < ActiveRecord::Migration
  def self.up
    create_table :nodes do |t|
      t.integer :pipe_id
      t.string  :type
      t.string  :position
      t.string  :content
      
      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end
