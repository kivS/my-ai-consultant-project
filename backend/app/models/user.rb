class User < ApplicationRecord
    has_many :chats
    has_secure_password
end
