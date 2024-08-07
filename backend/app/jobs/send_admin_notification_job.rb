require 'net/http'
require 'uri'

class SendAdminNotificationJob < ApplicationJob
  queue_as :default

  TELEGRAM_BOT_TOKEN = Rails.application.credentials.telegram.token!
  TELEGRAM_ADMIN_CHAT_ID = Rails.application.credentials.telegram.admin_chat_id!
  MESSAGE_FROM_WHICH_APP = "nabubit.com"

  def perform(message)

    uri = URI.parse("https://api.telegram.org/bot#{TELEGRAM_BOT_TOKEN}/sendMessage")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    message = "📣 Notification from #{MESSAGE_FROM_WHICH_APP} \n\n" + message

    request = Net::HTTP::Post.new(uri.request_uri)
    request.content_type = "application/json"
    request.body = {
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text: message
    }.to_json

    response = http.request(request)
    Rails.logger.debug("Telegram response: #{response.body}")
  
  end


end
