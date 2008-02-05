class CreatePipes < ActiveRecord::Migration
  def self.up
    create_table :pipes, :force => true do |t|
      t.string :title
      t.integer :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table :pipes
  end
end
