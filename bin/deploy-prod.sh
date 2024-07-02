

echo "pwd: $(pwd)"
echo "user: $USER"
echo "group: $(id -gn)"



if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo " ❌ Not on the main branch. Skipping..."
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo " ❌ Docker is not running. Please start Docker to continue."
    exit 1
fi



if git diff --name-only HEAD^ HEAD | grep --quiet -e "frontend/"; then
    echo "✅ Changes detected in the frontend/ directory. Processing..."

    MAIN_FOLDER=/opt/homebrew/var/www/my-ai-consultant-project/frontend

    # echo "🚀 Building docker image locally for x64..."
    
    # docker build -t registry.gitlab.com/kivs/my-ai-consultant-project $MAIN_FOLDER
    # docker push registry.gitlab.com/kivs/my-ai-consultant-project
    

    # echo "🚀 Updating frontend on my VPS"
    # ssh $myvps_host -p 54321 "cd /var/www/my-ai-consultant-project/frontend; git pull"
    # ssh $myvps_host -p 54321 "docker pull registry.gitlab.com/kivs/my-ai-consultant-project"
    # ssh $myvps_host -p 54321 "docker stop ai-consultant-frontend-container; docker rm ai-consultant-frontend-container"
    # # -v /var/www/my-ai-consultant-project/frontend:/app --user 0:0
    # ssh $myvps_host -p 54321 "docker run -d --restart unless-stopped  -p 5130:3000 --name ai-consultant-frontend-container registry.gitlab.com/kivs/my-ai-consultant-project; docker image  prune -f"
    # ssh $myvps_host -p 54321 "docker ps --latest; docker logs ai-consultant-frontend-container"


    echo "🚀 Building docker image locally for arm"
    
    docker build --platform linux/arm64 -t registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend $MAIN_FOLDER
    docker push registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend
    

    echo "🚀 Updating frontend on my Helsinki VPS"
    ssh $myhelsinkivps_host -p 54321 "cd /home/horse/www/ai-db-architecture-consultant-project/frontend; git pull"
    ssh $myhelsinkivps_host -p 54321 "docker pull registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend"
    ssh $myhelsinkivps_host -p 54321 "docker stop ai-db-consultant-frontend-container; docker rm ai-db-consultant-frontend-container"
    ssh $myhelsinkivps_host -p 54321 "docker run -d --restart unless-stopped  -p 3000:3000 --name ai-db-consultant-frontend-container registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend; docker image  prune -f"
    ssh $myhelsinkivps_host -p 54321 "docker ps --latest; docker logs ai-db-consultant-frontend-container"


    exit 0
fi

if git diff --name-only HEAD^ HEAD | grep --quiet -e "backend/"; then
    echo "✅ Changes detected in the backend/ directory. Processing..."

    MAIN_FOLDER=/opt/homebrew/var/www/my-ai-consultant-project/backend

  

    echo "🚀 Building docker image locally for arm"
    
    docker build --platform linux/arm64 -t registry.gitlab.com/kivs/my-ai-consultant-project:arm-backend $MAIN_FOLDER
    docker push registry.gitlab.com/kivs/my-ai-consultant-project:arm-backend
    

    echo "🚀 Updating frontend on my Helsinki VPS"
    ssh $myhelsinkivps_host -p 54321 "cd /home/horse/www/ai-db-architecture-consultant-project/backend; git pull"
    ssh $myhelsinkivps_host -p 54321 "docker pull registry.gitlab.com/kivs/my-ai-consultant-project:arm-backend"
    ssh $myhelsinkivps_host -p 54321 "docker stop ai-db-consultant-backend-container; docker rm ai-db-consultant-backend-container"
    ssh $myhelsinkivps_host -p 54321 "docker run -d --restart unless-stopped  -p 3001:3000 --name ai-db-consultant-backend-container registry.gitlab.com/kivs/my-ai-consultant-project:arm-backend; docker image  prune -f"
    ssh $myhelsinkivps_host -p 54321 "docker ps --latest; docker logs ai-db-consultant-backend-container"


    exit 0
fi


echo "❌ No valid changes detected, carry on!"
exit 0