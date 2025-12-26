#!/bin/bash

# echo "Starting Config Server..."
# (cd config-server && mvn spring-boot:run) &

# sleep 10

# echo "Starting Discovery Server..."
# (cd discovery-server && mvn spring-boot:run) &

# sleep 10

echo "Starting API Gateway..."
(cd api-gateway && mvn spring-boot:run) &

sleep 5

echo "Starting Services..."
(cd iam-service && mvn spring-boot:run) &
(cd vendor-service && mvn spring-boot:run) &

wait
