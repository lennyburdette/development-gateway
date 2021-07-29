# M1 Mac users: rover doesn't work on Linux ARM64
FROM amd64/node:14

WORKDIR /web

COPY package.json yarn.lock ./
RUN yarn install

COPY src ./src
COPY schemas ./schemas
COPY .env ./

CMD yarn start
