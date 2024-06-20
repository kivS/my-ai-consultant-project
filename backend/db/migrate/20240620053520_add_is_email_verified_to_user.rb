class AddIsEmailVerifiedToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :is_email_verified, :boolean, default: false
  end
end
