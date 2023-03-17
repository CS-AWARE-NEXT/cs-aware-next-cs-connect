#!/bin/bash

VERSION=latest
IMAGE_NAME=csconnect/mattermost:$VERSION

echo "Removing old $IMAGE_NAME image..."
docker rmi "$IMAGE_NAME"

echo "Building $IMAGE_NAME image..."
docker build -t "$IMAGE_NAME" -f docker/Dockerfile .

# echo "Pushing $IMAGE_NAME image..."
# docker push "$IMAGE_NAME"

echo "Completed."