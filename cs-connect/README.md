# CS Connect

An hyperlinking collaboration platform for CS-AWARE platform.

## How to build

Build the Docker image for the environment for building the plugin.

```sh
$ docker build -t cs-connect-base -f docker/dev.Dockerfile .
```

For development purposes, you can use this container as a dev container, for example through [VSCode](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). If you're developing on Windows with the WSL2 backend for docker, be sure to have the project cloned in the WSL2 filesystem (**NOT** on /mnt/c). This is required to avoid an excessive slowdown of IO operations caused by the WSL2-Windows filesystem communication, which causes Go commands to timeout and other slowdowns across the whole project.

Build the plugin by running the following command.

```sh
$ docker exec cs-connect-base sh -c "cd /home/cs-aware-next-cs-connect/cs-connect && make CONFIG_FILE_NAME=config.local.yml"
```

With the previously generated .tar.gz of the cs-connect plugin, you can now build the custom Mattermost Docker image with the plugin installed. Execute the following command from this folder as current working directory.

```sh
$ ./build.sh
```
