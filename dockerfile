FROM node:alpine

WORKDIR /tmp
COPY package.json /tmp/
COPY /src /tmp/src
RUN npm install

CMD npm run start

EXPOSE 3000
