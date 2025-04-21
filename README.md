# DDD subscription-management-service

Backend service containing App-Subscription, User, Account and related concerns. Operates a Http-Server and a Message Consumer.

> Intended to illustrate DDD architecture in a real life example. It isn't textbook DDD, authentication and user domain has 1-1 DDD breach. This architectural pattern is not a recipe for each and any softwares and or teams. In my opinion in this given service there is a ton of boilerplate, and abstraction - all softwares and teams need to find a good balance, this example is one solution from the many.

### OpenApi Documentation

{{host-url}}/swagger

## Requirements

- NodeJS 22.x

## Setup

> The service requires a Cognito User Pool and a Cognito User Client that is configured via .env file.

- Create `.env` file (with all the environment variables from `src/configs/app.config` file)
- Run:

```bash
$ npm ci
```

### Infrastructure

Local development infrastructural necessities are present in the `compose.yml`. This concern is separated from the software itself.

```bash
$ docker-compose up
```

## Run

The software can be ran in 2 modes: **http-server** either **consumer**. These are 2 separate concerns, dealt with separately. As **consumer**-s are very likely to clog, exhaust memory, have separate errors from the **http-server** it is ran separately in a separate runtime memory and cpu.

### Dev

> Run TypeScript

Http-server:

```bash
$ npm run dev http-server
```

Kafka consumer:

```bash
$ npm run dev consumer
```

### Prod

> Run JavaScript
> It first needs to compile using

```bash
$ npm run build
```

And then can be started using

Http-server:

```bash
$ npm start http-server
```

Kafka consumer:

```bash
$ npm start consumer
```

### Test

```bash
$ npm test
```

### Notes

Coming soon...
