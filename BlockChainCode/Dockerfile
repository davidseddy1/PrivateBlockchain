# syntax=docker/dockerfile:1

FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY ["package*.json", "./"]

RUN npm install --production

COPY . . 

EXPOSE 8000
CMD [ "node", "app.js" ]
