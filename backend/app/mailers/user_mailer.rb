class UserMailer < ApplicationMailer
    def registration_confirmation_email(user, verification_token)
        @user = user
        # TODO: this should come from .env
        @verification_link = "http://localhost:3000/verify-email?token=#{verification_token}"

        mail(to: @user.email, subject: 'Confirmation email')
    end
end
