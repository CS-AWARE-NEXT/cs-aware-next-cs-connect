#!/bin/bash

echo "Stopping containers if running."
docker compose down
echo "Containers stopped."

echo "Starting containers..."
docker compose up -d
echo "Containers started."

# echo "Cleaning up older volumes..."
# docker volume prune -f

echo "Completed."
