# CS-AWARE NEXT: CS-CONNECT

1. [cs-connect](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/tree/main/cs-connect) which enables the object-oriented collaboration mechanism with support for the hyperlinking system.
1. [cs-faker-data-provider](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/tree/main/cs-faker-data-provider) a web server that provides fake data using the RESTful protocol.

# Install
- Build the packages by following the steps for each project.
- Execute the command: `./start.sh` to clean the compose and run mattermost and cs-connect with the data provider.

<!-- # System architecture overview
![architecture](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/raw/main/assets/architecture_overview.png) -->

# Develop
Run in `cs-connect` directory:

```sh
$ docker build -t cs-connect-base -f docker/dev.Dockerfile .
```

Run in `cs-faker-data-provider` directory:

```sh
$ ./build.sh
```

Build and deploy (change the config file as needed by choosing from the existing files in cs-connect/config):

```sh
$ ./make.sh -b -p config.local.yml
```

Deploy (change the config file as needed by choosing from the existing files in cs-connect/config):

```sh
$ ./make.sh -p config.local.yml
```

# Troubleshooting
If you're developing on Windows through WSL2, you may have to fix some permissions first. It is recommended to clone the project on the WSL filesystem to avoid incurring in slowdowns caused by the Windows - WSL filesystem synchronization overhead.
Be sure that:
1) the `config/config` and `config/logs` folder are owned by the user 2000 (the Mattermost container user);
2) the `cs-connect/build/manifest` and `cs-connect/build/pluginctl` files should have the execute flag (this might be needed if you cloned the project on the Windows filesystem and later moved it on the WSL filesystem)

# Deploy on the AWS machine with the locally packaged cs-connect plugin
1) Build the cs-connect package locally as instructed in [its README](cs-connect/README.md). Be sure to use the correct config passed as argument. This is required due to the AWS machine not being powerful enough for the build step.
2) Copy the packaged plugin to the machine with the `aws.copy-package.sh` script. The script assumes the existence of the required private key to authenticate with the machine in the path `~/.ssh/isislab/cs-connect-demo.cs-aware.eu`.
3) Access the machine via SSH.
4) Execute a git pull. This isn't required to update the cs-connect plugin, but it is required if you want to update the cs-faker-data-provider, since the latter is built directly on the AWS machine.
5) Change the working directory to cs-connect and run the following command, after updating the version according to the change done:
```sh
sudo docker build -t csconnect/mattermost:{VERSION} -f docker/package.Dockerfile . 
```
6) If needed, update the faker module by navigating to its directory and executing the following script with the proper version, based on the changes done:
```sh
./build.sh {VERSION}
```
7) Navigate to the `/opt/cs-connect` directory.
8) Edit the docker-compose.yml file with sudo (`sudo vim docker-compose.yml`) to upgrade the versions of the cs-connect and/or faker images according to the versions chosen previously.
9) Update the environment:
```sh
sudo docker-compose up -d
```
10) Clean up the images that aren't needed anymore. Keep an eye out for the <none> image generated while updating the faker module image, which should also be deleted.

# Deploy on local machine with the locally packaged cs-connect plugin
1) Build the cs-connect package locally as instructed in [its README](cs-connect/README.md). Be sure to use the correct config passed as argument. This is required due to the AWS machine not being powerful enough for the build step.
2) Copy the packaged plugin to the local machine with the `local.copy-package.sh` script. The script assumes the user has access to the `www.isislab.it` machine used for development.
3) Execute a git pull. This isn't required to update the cs-connect plugin, but it is required if you want to update the cs-faker-data-provider, since the latter is built directly on the local machine.
4) Change the working directory to cs-connect and run the following command, after updating the version according to the change done:
```sh
docker build -t csconnect/mattermost:{VERSION} -f docker/package.Dockerfile . 
```
5) If needed, update the faker module by navigating to its directory and executing the following script with the proper version, based on the changes done:
```sh
./build.sh {VERSION}
```
6) Edit the docker-compose.yml file with sudo (`vim docker-compose.yml`) to upgrade the versions of the cs-connect and/or faker images according to the versions chosen previously.
7) Delete the `cs-aware-connect` plugin under the `config/plugins` folder.
8) Run or Uudate the environment:
```sh
bash start.sh -p
```
9) Clean up the images that aren't needed anymore. Keep an eye out for the <none> image generated while updating the faker module image, which should also be deleted.
10) Undeploy using:
```sh
docker compose down
```
