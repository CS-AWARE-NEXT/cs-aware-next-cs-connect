FROM ubuntu

RUN mkdir -p /home/cs-aware-next-cs-connect

RUN apt-get update

# Install tools
RUN apt-get install -y \
    software-properties-common \
    curl wget \
    zip tar \
    git \
    nano vim \
    npm nodejs python2

RUN apt-get upgrade -y

# Install another Node version
RUN npm install -g n
RUN n 18.17.0
RUN npm install -g npm

# Install eslint
RUN npm install -g eslint

# Install Go
RUN cd /tmp
RUN wget https://dl.google.com/go/go1.18.linux-amd64.tar.gz
RUN tar -xvf go1.18.linux-amd64.tar.gz
RUN mv go ../usr/local/
RUN rm go1.18.linux-amd64.tar.gz

ENV GOROOT=/usr/local/go
ENV GOPATH=$HOME/go
ENV PATH=$GOPATH/bin:$GOROOT/bin:$PATH

# Install golanci-lint: https://golangci-lint.run/usage/install/#local-installation
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh \
    | sh -s -- -b $(go env GOPATH)/bin v1.50.1

RUN go install -v golang.org/x/tools/gopls@latest
ENTRYPOINT ["/bin/bash"]
