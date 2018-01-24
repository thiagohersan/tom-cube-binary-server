FROM node:4.8.7-stretch

ENV GIT_URL https://github.com/thiagohersan/tom-cube

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && cp -a /tmp/node_modules /opt/server/

RUN mkdir -p /opt/server/app/bin
WORKDIR /opt/server/app/bin

ADD https://api.github.com/repos/thiagohersan/tom-cube/git/refs/heads/master version.json

RUN curl -Ls -H 'Accept: application/json' $GIT_URL/releases/latest | \
    sed -e 's/.*"tag_name":"\([^"]*\)".*/\1/' > /tmp/LATEST_RELEASE

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    curl -Os $GIT_URL/releases/download/$LATEST_RELEASE/tom-cube.bin

WORKDIR /opt/server
ADD package.json /opt/server/
ADD app/*.js /opt/server/app/

CMD ["npm", "run", "start"]
