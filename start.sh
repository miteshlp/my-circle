# Remove existing container of node and mongo
docker rm -f my_circle_with_docker
docker rm -f my_circle_database

# Remove existing image if my-circle
docker rmi -f final-project2-my_circle_node

# Check if the script is being run with root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "Please run this script as root or with \e[32msudo sh start.sh\e[0m"
    exit 1
fi

# Log the message with green color
log "Running \e[32msudo sh start.sh\e[0m"

docker-compose up -d