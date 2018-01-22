FROM node:4.8.7-stretch

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && cp -a /tmp/node_modules /opt/server/

WORKDIR /opt/server
ADD . /opt/server

CMD ["npm", "run", "start"]
