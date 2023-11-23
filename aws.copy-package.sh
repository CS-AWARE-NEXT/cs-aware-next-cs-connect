#!/bin/bash

mkdir -p ~/cs-connect-packages

docker cp cs-connect-base:/home/cs-aware-next-cs-connect/cs-connect/dist/cs-aware-connect-+.tar.gz \
    ~/cs-connect-packages/cs-aware-connect-+.tar.gz

scp -i ~/cs-connect-demo.cs-aware.eu \
    ./cs-connect-packages/cs-aware-connect-+.tar.gz \
    ubuntu@cs-connect-demo.cs-aware.eu:/home/ubuntu/cs-aware-next-cs-connect/cs-connect/docker/package/cs-aware-connect-+.tar.gz