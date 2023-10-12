# CS-AWARE NEXT: CS-CONNECT

1. [cs-connect](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/tree/main/cs-connect) which enables the object-oriented collaboration mechanism with support for the hyperlinking system.
1. [cs-faker-data-provider](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/tree/main/cs-faker-data-provider) a web server that provides fake data using the RESTful protocol.

# Install
- Build the packages by following the steps for each project.
- Execute the command: `sudo ./start.sh` to clean the compose and run mattermost and cs-connect with the data provider.

# System architecture overview
![architecture](https://github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/raw/main/assets/architecture_overview.png)

# Develop
Run in `cs-connect` directory:

```sh
$ sudo docker build -t cs-connect-base -f docker/dev.Dockerfile .
```

Run in `cs-faker-data-provider` directory:

```sh
$ sudo ./build.sh
```

Build and deploy:

```sh
$ sudo ./make.sh -b -p
```

Deploy:

```sh
$ sudo ./make.sh -p
```