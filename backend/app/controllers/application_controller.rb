class ApplicationController < ActionController::API

    def authorize_request
        header = request.headers['Authorization']
        header = header.split(' ').last if header
        begin
            @decoded = JWT.decode(header, Rails.application.credentials.secret_key_base,  true, { algorithm: 'HS256' })[0]
            @current_user = User.find(@decoded['user_id'])
        rescue ActiveRecord::RecordNotFound => e
            render json: { errors: e.message }, status: :unauthorized
        rescue JWT::DecodeError => e
            render json: { errors: e.message }, status: :unauthorized
        end
    end
end
