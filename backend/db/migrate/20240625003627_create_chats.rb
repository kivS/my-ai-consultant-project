class CreateChats < ActiveRecord::Migration[7.1]
  def change
    create_table :chats, id: :uuid do |t|
      t.string :title
      t.json :messages, default: []
      t.belongs_to :user, foreign_key: true
      t.timestamps
    end
  end
end
