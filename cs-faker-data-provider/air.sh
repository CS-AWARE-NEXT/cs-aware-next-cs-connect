# !/bin/bash

# setup go path for air
# more at https://github.com/air-verse/air
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
export PATH=$PATH:$(go env GOPATH)/bin

air -v