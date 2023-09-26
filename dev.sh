#!/bin/bash

PLUGIN_NAME=cs-aware-connect
CONTAINER_NAME=cs-connect-base

# Options
PRUNE_VOLUMES=false
UNDEPLOY=false

# Parse the command-line options
while getopts "pu" opt; do
    case $opt in
        p)
            echo "Prune volumes option set."
            PRUNE_VOLUMES=true
            ;;
        u)
            UNDEPLOY=true
            ;;
        \?)
            echo "Invalid option: -$OPTARG"
            exit 1
            ;;
    esac
done

if [ "$UNDEPLOY" = true ]; then
    echo "Stopping containers..."
    docker compose -f dev.docker-compose.yml down
    echo "Containers stopped."
    exit 0
fi

# Shift the parsed options, so $1 will point to the first non-option argument (if any).
shift "$((OPTIND - 1))"

echo "Stopping containers if running..."
docker compose -f dev.docker-compose.yml down
echo "Containers stopped."

DIR=./config/plugins/$PLUGIN_NAME
echo "Checking if the $DIR directory exist..."
if [ -d "$DIR" ];
then
    echo "$DIR directory exists. Removing directory..."
    rm -r $DIR
    echo "$DIR directory removed."
else
    echo "$DIR directory does not exist. No need to remove it."
fi

PLUGIN_DIR=cs-aware-next-cs-connect/cs-connect
CONTAINER_PLUGIN_DIR=/home/$PLUGIN_DIR/dist/$PLUGIN_NAME
HOST_PLUGIN_DIR=./config/plugins/$PLUGIN_NAME
echo "Copying pluging from $CONTAINER_NAME:$CONTAINER_PLUGIN_DIR to $HOST_PLUGIN_DIR."
docker cp $CONTAINER_NAME:$CONTAINER_PLUGIN_DIR $HOST_PLUGIN_DIR
echo "Copy completed."

echo "Starting containers..."
docker compose -f dev.docker-compose.yml up -d
echo "Containers started."

if [ "$PRUNE_VOLUMES" = true ]; then
    echo "Cleaning up older volumes..."
    docker volume prune -f
    echo "Completed."
fi

echo "Completed."