FROM node:9

ENV REDIS_HOST "redis"

RUN mkdir /turns-ms
WORKDIR /turns-ms

COPY . /turns-ms
COPY package.json /turns-ms
COPY package-lock.json /turns-ms
RUN npm install

CMD ["npm", "start"]

