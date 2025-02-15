FROM node:22.3.0-slim

WORKDIR /usr/src/app

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

RUN apt-get update -y && apt-get install -y openssl

EXPOSE 80

CMD ["npm", "run", "dev"]