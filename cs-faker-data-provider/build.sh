#!/bin/bash

VERSION=latest

if [ -z "$1" ]
  then
    echo "Missing version, using $VERSION as default."
  else
    VERSION=$1
fi

IMAGE_NAME=csconnect/cs-data-provider:$VERSION

echo "Removing old $IMAGE_NAME image"
docker rmi "$IMAGE_NAME"

echo "Building $IMAGE_NAME image"
docker build -t "$IMAGE_NAME" .

# echo "Pushing $IMAGE_NAME image"
# docker push $IMAGE_NAME
