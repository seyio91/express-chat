FROM node:12-alpine

WORKDIR /usr/src/app
COPY express-chat/package*.json ./
RUN npm install
COPY express-chat/. .
EXPOSE 5000
CMD ["node", "index.js"]

