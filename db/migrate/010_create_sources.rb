class CreateSources < ActiveRecord::Migration
  def self.up
    create_table :sources do |t|
      t.integer :user_id
      t.string :name
      t.string :iri

      t.timestamps
    end
  end

  def self.down
    drop_table :sources
  end
end
