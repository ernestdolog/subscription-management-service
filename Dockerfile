FROM node:22-alpine

# Install dependencies almost always needed
RUN apk --no-cache add python3 make g++ && ln -sf python3 /usr/bin/python

WORKDIR /home/node/app

COPY . .

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION
RUN sed -i "s/__ci_managed__/$APP_VERSION/g" package.json

USER root
RUN rm -fr node_modules
RUN chown -R node:node /home/node

USER node

RUN npm ci && \
    npm cache clean --force  && \
    npm run build

EXPOSE 4000

CMD npm start