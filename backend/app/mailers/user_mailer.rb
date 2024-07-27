class UserMailer < ApplicationMailer
    def registration_confirmation_email(user, verification_token)
        @user = user

        @verification_link = "#{Rails.application.credentials.frontend_url}/verify-email?token=#{verification_token}"

        mail(to: @user.email, subject: 'Confirmation email', track_opens: true, message_stream: 'outbound')
    end
end
