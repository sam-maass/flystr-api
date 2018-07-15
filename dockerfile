FROM node:alpine
WORKDIR /tmp
COPY package.json /tmp/
COPY package-lock.json /tmp/
COPY /src /tmp/src
RUN apk add python && npm install
CMD npm run build


