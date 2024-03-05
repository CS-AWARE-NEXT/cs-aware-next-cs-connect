#!/bin/bash

CONTAINER_NAME=cs-connect-base
PACKAGE_NAME=cs-aware-connect-+.tar.gz

HOST_PACKAGE_DIR=./cs-connect/docker/package
HOST_PACKAGE=$HOST_PACKAGE_DIR/$PACKAGE_NAME

HOST_TEMP_PACKAGE_DIR=./cs-connect-packages
HOST_TEMP_PACKAGE=$HOST_TEMP_PACKAGE_DIR/$PACKAGE_NAME

mkdir -p $HOST_TEMP_PACKAGE_DIR

echo "Remote copying pluging from $CONTAINER_NAME to $HOST_TEMP_PACKAGE."
ssh tiziano@www.isislab.it \
    "docker cp $CONTAINER_NAME:/home/cs-aware-next-cs-connect/cs-connect/dist/$PACKAGE_NAME /home/tiziano/packages/$PACKAGE_NAME"

scp tiziano@www.isislab.it:/home/tiziano/packages/$PACKAGE_NAME $HOST_TEMP_PACKAGE
echo "Remote copy completed."

echo "Copying pluging from $HOST_TEMP_PACKAGE to $HOST_PLUGIN_DIR."
cp -r $HOST_TEMP_PACKAGE $HOST_PLUGIN_DIR
echo "Copy completed."
