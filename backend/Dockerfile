FROM node:22.3.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run tsc

EXPOSE 80

CMD ["npm", "start"]
