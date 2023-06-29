#!/bin/bash

# Executed based on 0 0 0 8 5/3 * *

# Reach directory where docker compose file is located
cd / && cd opt/cs-connect/

# Restart server to renew and load the new certificate
sudo docker-compose down
sudo docker-compose up -d