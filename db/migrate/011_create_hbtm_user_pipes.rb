class CreateHbtmUserPipes < ActiveRecord::Migration
  def self.up
    create_table "pipes_sources", :id => false do |t|
      t.column "pipe_id", :integer, :null => false
      t.column "source_id",  :integer, :null => false
    end    
  end

  def self.down
    drop_table :sources_users
  end
end
