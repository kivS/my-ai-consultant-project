class AuthController < ApplicationController
  before_action :authorize_request, except: [:login, :register, :verify_email]

  def login
    @user = User.find_by_email(params[:email])
    if @user&.authenticate(params[:password])
      token = encode_token({ user_id: @user.id })
      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def register
    @user = User.new(user_params)
    if @user.save
      token = encode_token({ user_id: @user.id })

      verification_token = encode_token({ email: @user.email})

      UserMailer.registration_confirmation_email(@user, verification_token).deliver_later
      
      render json: { token: token }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def verify_email
    Rails.logger.info("Params: #{params}")

    token = params.permit(:token)[:token]

    decoded_payload = decode_token(token)

    if(decoded_payload.nil?)
      return render json: { error: "Invalid confirmation token" }, status: :unprocessable_entity 
    end

    Rails.logger.info("Decoded payload: #{decoded_payload}")

    @user = User.find_by_email(decoded_payload["email"])

    if @user.nil?
      return render json: { error: "User not found" }, status: :unprocessable_entity 
    end

    @user.is_email_verified = true
    @user.save!

    return render json: {status: 'Email is verified'}, status: :created

  end

  
  private

  def user_params
    params.permit(:email, :password, :password_confirmation)
  end

  def encode_token(payload)
    secret_key = Rails.application.credentials.secret_key_base
    algorithm = 'HS256'
    JWT.encode(payload, secret_key, algorithm)
  end

  def decode_token(payload)
    secret_key = Rails.application.credentials.secret_key_base
    algorithm = 'HS256'

    begin
      decoded_token = JWT.decode(payload, secret_key, true, { algorithm: algorithm })
      decoded_token[0] # Return the payload part of the token
    rescue JWT::DecodeError => e
      Rails.logger.error("JWT DecodeError: #{e.message}")
      nil # Return nil if the token is invalid
    end
  
  end


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