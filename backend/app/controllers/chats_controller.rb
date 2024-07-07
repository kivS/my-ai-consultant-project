class ChatsController < ApplicationController
  before_action :authorize_request
  before_action :set_chat, only: %i[ show update destroy update_whiteboard ]

  # GET /chats
  def index
    @chats =  @current_user.chats
    render json: @chats.as_json(
      include: {
        database_whiteboard: {}
      }
    )
  end

  # GET /chats/1
  def show
    render json: @chat.as_json(
      include: {
        database_whiteboard: {}
      }
    )
  end

  # POST /chats
  def create
    @chat = Chat.new(chat_params)
    @chat.user_id = @current_user.id


    if @chat.save
      render json: @chat, status: :created, location: @chat
    else
      render json: @chat.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /chats/1
  def update
    chat_update_params = params.require(:chat).permit!
    
    if @chat.update(chat_update_params)
      render json: @chat
    else
      render json: @chat.errors, status: :unprocessable_entity
    end
  end

  # DELETE /chats/1
  def destroy
    @chat.destroy!
  end


  # PUT /chats/1/whiteboard
  def update_whiteboard
    whiteboard_update_params = params.require(:database_whiteboard).permit!
    
    if @chat.database_whiteboard.update(whiteboard_update_params)
      render json: @chat.database_whiteboard
    else
      render json: @chat.database_whiteboard.errors, status: :unprocessable_entity
    end

  end



  private
    # Use callbacks to share common setup or constraints between actions.
    def set_chat
      @chat = @current_user.chats.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def chat_params
      params.require(:chat).permit(
        :title, 
        messages: [:id, :role, :content]
      )
    end
end
