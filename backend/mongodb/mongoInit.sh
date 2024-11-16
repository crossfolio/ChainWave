#! /bin/bash
sudo chmod 600 keyFile

# Stop and remove the containers
docker-compose -f docker-compose-mongo.yaml down -v

docker-compose -f docker-compose-mongo.yaml up -d

sleep 10

docker exec -it mongodb mongosh --host mongodb --username root --password password --authenticationDatabase admin --eval "rs.initiate()"