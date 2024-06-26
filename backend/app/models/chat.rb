class Chat < ApplicationRecord
    belongs_to :user
    has_one :database_whiteboard, dependent: :destroy
    before_create :generate_uuid
    after_create :add_whiteboard_to_chat

    private

    def generate_uuid
        self.id = SecureRandom.uuid_v7
    end

    def add_whiteboard_to_chat
        create_database_whiteboard
    end
end
