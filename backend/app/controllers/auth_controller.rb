class AuthController < ApplicationController
  before_action :authorize_request, except: [:login, :register, :verify_email]


  def get_user
    @current_user = @current_user
    if @current_user
      render json: @current_user.as_json(
        only: [:email, :is_email_verified]
      ), status: :ok
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end
  

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


    begin
      if @user.save!
        token = encode_token({ user_id: @user.id })

        verification_token = encode_token({ email: @user.email})

        UserMailer.registration_confirmation_email(@user, verification_token).deliver_later
        
        render json: { token: token }, status: :created
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
      
    rescue ActiveRecord::RecordNotUnique 
      return render json: { error: "Account with this email already exists" }, status: :unprocessable_entity
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

    return render json: {is_verified: @user.is_email_verified}, status: :ok

  end

  
  private

  def user_params
    params.permit(:email, :password, :password_confirmation)
  end

  def encode_token(payload)
    secret_key = Rails.application.credentials.secret_key_base
    algorithm = 'HS256'
    payload[:timestamp] = Time.now.to_i
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

end