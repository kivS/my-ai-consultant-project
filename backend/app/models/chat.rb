class Chat < ApplicationRecord
    before_create :generate_uuid

    private

    def generate_uuid
        self.id = SecureRandom.uuid_v7
    end
end
