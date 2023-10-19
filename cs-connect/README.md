# CS Connect

An hyperlinking collaboration platform for CS-AWARE platform.

## How to build

Build the Docker image for the environment for building the plugin...

```sh
$ docker build -t cs-connect-base -f docker/dev.Dockerfile .
```

... and create a container from it. The container will be used as a dev container to build the plugin. If you've already created the container, simply start it.

```sh
$ docker run -it --name cs-connect-base cs-connect-base:latest
```

Build the plugin by running the following command.

```sh
$ docker exec cs-connect-base sh -c "cd /home/cs-aware-next-cs-connect/cs-connect && make CONFIG_FILE_NAME=config.local.yml"
```

With the previously generated .tar.gz of the cs-connect plugin, you can now build the custom Mattermost Docker image with the plugin installed. Execute the following command from this folder as current working directory.

```sh
$ ./build.sh
```