Rails.application.routes.draw do

  resources :chats do
    member do
      put 'update_whiteboard', to: 'chats#update_whiteboard'
    end
  end
  
  

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  post 'auth/login', to: 'auth#login'
  post 'auth/register', to: 'auth#register'
  post 'auth/verify-email', to: 'auth#verify_email'
  get 'auth/get-user', to: 'auth#get_user'
  get 'auth/is-user-rate-limited', to: 'auth#is_user_rate_limited'
end
