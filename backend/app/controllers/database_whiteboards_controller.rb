class DatabaseWhiteboardsController < ApplicationController
  before_action :set_database_whiteboard, only: %i[ show update destroy ]

  # GET /database_whiteboards
  def index
    @database_whiteboards = DatabaseWhiteboard.all

    render json: @database_whiteboards
  end

  # GET /database_whiteboards/1
  def show
    render json: @database_whiteboard
  end

  # POST /database_whiteboards
  def create
    @database_whiteboard = DatabaseWhiteboard.new(database_whiteboard_params)

    if @database_whiteboard.save
      render json: @database_whiteboard, status: :created, location: @database_whiteboard
    else
      render json: @database_whiteboard.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /database_whiteboards/1
  def update
    if @database_whiteboard.update(database_whiteboard_params)
      render json: @database_whiteboard
    else
      render json: @database_whiteboard.errors, status: :unprocessable_entity
    end
  end

  # DELETE /database_whiteboards/1
  def destroy
    @database_whiteboard.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_database_whiteboard
      @database_whiteboard = DatabaseWhiteboard.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def database_whiteboard_params
      params.require(:database_whiteboard).permit(:chat_id)
    end
end
