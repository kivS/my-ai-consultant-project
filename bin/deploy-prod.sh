

echo "pwd: $(pwd)"
echo "user: $USER"
echo "group: $(id -gn)"



if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo " ❌ Not on the main branch. Skipping..."
    exit 1
fi




if git diff --name-only HEAD^ HEAD | grep --quiet -e "frontend/"; then
    echo "✅ Changes detected in the fronend/ directory. Processing..."

    MAIN_FOLDER=/opt/homebrew/var/www/my-ai-consultant-project/frontend

    echo "🚀 Building docker image locally..."
    
    docker build -t registry.gitlab.com/kivs/my-ai-consultant-project $MAIN_FOLDER
    docker push registry.gitlab.com/kivs/my-ai-consultant-project
    

    echo "🚀 Updating frontend on my VPS"
    ssh $myvps_host -p 54321 "cd /var/www/my-ai-consultant-project/frontend; git pull"
    ssh $myvps_host -p 54321 "docker pull registry.gitlab.com/kivs/my-ai-consultant-project"
    ssh $myvps_host -p 54321 "docker stop ai-consultant-frontend-container; docker rm ai-consultant-frontend-container"
    # -v /var/www/my-ai-consultant-project/frontend:/app --user 0:0
    ssh $myvps_host -p 54321 "docker run -d --restart unless-stopped  -p 5130:3000 --name ai-consultant-frontend-container registry.gitlab.com/kivs/my-ai-consultant-project; docker image  prune -f"
    ssh $myvps_host -p 54321 "docker ps --latest; docker logs ai-consultant-frontend-container -f"


    # echo "🚀 Building docker image locally for arm"
    
    # docker build -t registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend $MAIN_FOLDER
    # docker push registry.gitlab.com/kivs/my-ai-consultant-project:arm-frontend
    

    # echo "🚀 Updating frontend on my Helsinki VPS"
    # ssh $myvps_host -p 54321 "cd /var/www/my-ai-consultant-project/frontend; git pull"
    # ssh $myvps_host -p 54321 "docker pull registry.gitlab.com/kivs/my-ai-consultant-project"
    # ssh $myvps_host -p 54321 "docker stop ai-consultant-frontend-container; docker rm ai-consultant-frontend-container"
    # # -v /var/www/my-ai-consultant-project/frontend:/app --user 0:0
    # ssh $myvps_host -p 54321 "docker run -d --restart unless-stopped  -p 5130:3000 --name ai-consultant-frontend-container registry.gitlab.com/kivs/my-ai-consultant-project; docker image  prune -f"
    # ssh $myvps_host -p 54321 "docker ps --latest; docker logs ai-consultant-frontend-container -f"


    exit 0
fi



echo "❌ No valid changes detected, carry on!"
exit 0