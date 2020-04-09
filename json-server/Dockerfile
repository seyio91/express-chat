FROM node:12-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY db.json .

EXPOSE 3000

CMD ["npx", "json-server","--host", "0.0.0.0", "--watch", "db.json"]

