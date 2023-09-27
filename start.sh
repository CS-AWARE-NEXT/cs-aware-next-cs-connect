#!/bin/bash

PRUNE_VOLUMES=false

# Parse the command-line options
while getopts "p" opt; do
    case $opt in
        p)
            echo "Prune volumes option set."
            PRUNE_VOLUMES=true
            ;;
        \?)
            echo "Invalid option: -$OPTARG."
            exit 1
            ;;
    esac
done

# Shift the parsed options, so $1 will point to the first non-option argument (if any).
shift "$((OPTIND - 1))"

echo "Stopping containers if running."
docker compose down
echo "Containers stopped."

echo "Starting containers..."
docker compose up -d
echo "Containers started."

if [ "$PRUNE_VOLUMES" = true ]; then
    echo "Cleaning up older volumes..."
    docker volume prune -f
    echo "Completed."
fi

echo "Completed."
