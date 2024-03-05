#!/bin/bash

CONTAINER_NAME=cs-connect-base
PLUGIN_NAME=cs-aware-connect
HOST_PLUGIN_DIR=./config/plugins/$PLUGIN_NAME
HOST_TEMP_DIR=./cs-connect-packages
HOST_TEMP_PLUGIN_DIR=$HOST_TEMP_DIR/cs-aware-connect-+.tar.gz

mkdir -p $HOST_TEMP_DIR

echo "Remote copying pluging from $CONTAINER_NAME to $HOST_TEMP_PLUGIN_DIR."
ssh tiziano@www.isislab.it \
    "docker cp $CONTAINER_NAME:/home/cs-aware-next-cs-connect/cs-connect/dist/cs-aware-connect-+.tar.gz /home/tiziano/packages/cs-aware-connect-+.tar.gz"

scp tiziano@www.isislab.it:/home/tiziano/packages/cs-aware-connect-+.tar.gz $HOST_TEMP_PLUGIN_DIR
echo "Remote copy completed."

echo "Copying pluging from $HOST_TEMP_PLUGIN_DIR to $HOST_PLUGIN_DIR."
cp -r $HOST_TEMP_PLUGIN_DIR $HOST_PLUGIN_DIR
echo "Copy completed."
