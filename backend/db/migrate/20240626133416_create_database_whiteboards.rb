class CreateDatabaseWhiteboards < ActiveRecord::Migration[7.1]
  def change
    create_table :database_whiteboards do |t|
      t.references :chat, null: false, foreign_key: true, type: :uuid
      t.json :whiteboard, default: {}
      t.timestamps
    end
  end
end
