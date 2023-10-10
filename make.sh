# Global variables
CONFIG_FILE_NAME=config.local.lab.yml

# Options
BUILD=false
PRUNE_VOLUMES=false
PRUNE_PLUGINS=false
UNDEPLOY=false

# Function to handle option parsing
parse_options() {
    # Parse the command-line options
    while getopts "npu" opt; do
        case $opt in
            b)
                echo "Build option set."
                BUILD=true
                ;;
            n)
                echo "Prune plugins option set."
                PRUNE_PLUGINS=true
                ;;
            p)
                echo "Prune volumes option set."
                PRUNE_VOLUMES=true
                ;;
            u)
                UNDEPLOY=true
                ;;
            \?)
                echo "Invalid option: -$OPTARG."
                exit 1
                ;;
        esac
    done
}

select_config_file () {
    if [ -z "$1" ]; then
        echo "Using default config file: $CONFIG_FILE_NAME."
    else
        CONFIG_FILE_NAME=$1
        echo "Using custom config file: $CONFIG_FILE_NAME."
    fi
}

# Function to build the web application
build_web_application() {
    echo "Building web application..."
    docker exec cs-connect-base \
        sh -c "cd /home/cs-aware-next-cs-connect/cs-connect && make CONFIG_FILE_NAME=$CONFIG_FILE_NAME"
    echo "Finished building web application."
}

# Function to start the development environment
start_dev_environment() {
    echo "Starting dev environment..."
    if [ "$PRUNE_VOLUMES" = true ] && [ "$PRUNE_PLUGINS" = true ]; then
        sh dev.sh -p -n
    elif [ "$PRUNE_VOLUMES" = true ]; then
        sh dev.sh -p
    elif [ "$PRUNE_PLUGINS" = true ]; then
        sh dev.sh -n
    else
        sh dev.sh
    fi
    echo "Started dev environment."
}

# Function to stop the development environment
stop_dev_environment() {
    echo "Stopping dev environment..."
    sh dev.sh -u
    echo "Stopped dev environment."
    exit 0
}

parse_options "$@"

# Shift the parsed options, so $1 will point to the first non-option argument (if any)
shift "$((OPTIND - 1))"

select_config_file "$1"

if [ "$UNDEPLOY" = true ]; then
    stop_dev_environment
fi

if [ "$BUILD" = true ]; then
    build_web_application
fi

start_dev_environment

echo "Completed."