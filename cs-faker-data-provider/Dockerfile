FROM golang:1.16-alpine AS build
WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .
RUN go build -o /csa-server

FROM golang:1.16-alpine AS run
WORKDIR /app

COPY --from=build /csa-server /csa-server
COPY .env .env

EXPOSE 3000

CMD [ "/csa-server" ]