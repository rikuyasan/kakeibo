FROM node:22.3.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN echo "test"

COPY . .
RUN npm run tsc

EXPOSE 80

CMD ["npm", "start"]
