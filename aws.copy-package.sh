#!/bin/bash

CONTAINER_NAME=cs-connect-base
PACKAGE_NAME=cs-aware-connect-+.tar.gz

HOST_TEMP_PACKAGE_DIR=./cs-connect-packages
HOST_TEMP_PACKAGE=$HOST_TEMP_PACKAGE_DIR/$PACKAGE_NAME

mkdir -p $HOST_TEMP_PACKAGE_DIR

echo "Copying pluging from $CONTAINER_NAME to $HOST_TEMP_PACKAGE."
docker cp $CONTAINER_NAME:/home/cs-aware-next-cs-connect/cs-connect/dist/$PACKAGE_NAME $HOST_TEMP_PACKAGE
echo "Copy completed."

echo "Remote copying pluging from $HOST_TEMP_PACKAGE to AWS."
scp -i ~/.ssh/isislab/cs-connect-demo.cs-aware.eu \
    $HOST_TEMP_PACKAGE \
    ubuntu@cs-connect-demo.cs-aware.eu:/home/ubuntu/cs-aware-next-cs-connect/cs-connect/docker/package/$PACKAGE_NAME
echo "Remote copy completed."

echo "Removing temporary package."
rm -r $HOST_TEMP_PACKAGE
echo "Temporary package removed."
