# CS Connect

An hyperlinking collaboration platform for CS-AWARE platform.

## How to build

Build the Docker image for the environment for building the plugin.

```sh
$ docker build -t cs-connect-base -f docker/dev.Dockerfile .
```

For development purposes, you can use this container as a dev container, for example through [VSCode](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). If you're developing on Windows with the WSL2 backend for docker, be sure to have the project cloned in the WSL2 filesystem (**NOT** on /mnt/c). This is required to avoid an excessive slowdown of IO operations caused by the WSL2-Windows filesystem communication, which causes Go commands to timeout and other slowdowns across the whole project.

Clone the repository within the `cs-connect-base` environment and build the plugin by running the following command. Change `CONFIG_FILE_NAME` according to the configuration file you want to use. This process is slow the first time because there is no cache, but it will be faster in subsequent builds.

```sh
$ docker exec cs-connect-base sh -c "cd /home/cs-aware-next-cs-connect/cs-connect && make CONFIG_FILE_NAME=config.local.yml"
```

With the previously generated .tar.gz of the cs-connect plugin, you can copy the built plugin in the necessary directory.

```sh
$ docker cp cs-connect-base:/home/cs-aware-next-cs-connect/cs-connect/dist/cs-aware-connect-+.tar.gz home/ubuntu/cs-aware-next-cs-connect/cs-connect/docker/package/cs-aware-connect-+.tar.gz
```

Then, to build the final image, run the following command.

```sh
$ docker build -t csconnect/mattermost:{VERSION} -f docker/package.Dockerfile .
```

Or build everything with the following command (`cs-connect-base` still required). This approach is slower because it builds everything from scratch everytime, while building the plugin separately in the `cs-connect-base` environment leverages caching to make builds faster.

```sh
$ ./build.sh
```
