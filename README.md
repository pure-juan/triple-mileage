# Triple Mileage Service

Author: Juan Kim

## Requirements

- Docker
- Docker Compose
- Node.JS >= 14.19.3
- Yarn

## DB Script 위치

1. `docker/mysql/initdb.d/init.sh`
2. `docker/mysql/initdb.d/init.sql`

## Install

### Database

1. `cd docker`
2. `docker-compose up -d` or `docker compose up -d`

### Node.JS

1. `yarn install`
2. `cp .env.template .env`

## How to Run?

`yarn start:dev`

## API Resources

### Event API

[REST 테스트 파일](http/event.rest)

```
POST https://localhost:3000/event
```

## Clean-up

```
$ cd docker; docker-compose down
or
$ cd docker; docker compose down

$ rm -rf mysql/data
or
docker/mysql/data 를 지워주세요
```
