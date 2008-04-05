class CreateHbtmUserPipes < ActiveRecord::Migration
  def self.up
    create_table "sources_users", :id => false do |t|
      t.column "user_id", :integer, :null => false
      t.column "source_id",  :integer, :null => false
    end    
  end

  def self.down
    drop_table :sources_users
  end
end
