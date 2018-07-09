FROM node:8-stretch

ENV GIT_REPO_URL https://github.com/thiagohersan/tom-cube
ENV GIT_API_URL https://api.github.com/repos/thiagohersan/tom-cube/git

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && cp -a /tmp/node_modules /opt/server/

RUN mkdir -p /opt/server/app/bin
WORKDIR /opt/server/app/bin

ADD $GIT_API_URL/refs/heads/master /tmp/version.json

RUN curl -Ls -H 'Accept: application/json' $GIT_REPO_URL/releases/latest | \
    sed -e 's/.*"tag_name":"\([^"]*\)".*/\1/' > /tmp/LATEST_RELEASE

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    mkdir -p /opt/server/app/bin/$LATEST_RELEASE

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    cd /opt/server/app/bin/$LATEST_RELEASE && \
    wget $GIT_REPO_URL/releases/download/$LATEST_RELEASE/tom-cube.bin

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    cd /opt/server/app/bin/$LATEST_RELEASE && \
    wget -O version.json $GIT_API_URL/refs/tags/$LATEST_RELEASE

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    cp -r /opt/server/app/bin/$LATEST_RELEASE /opt/server/app/bin/latest

WORKDIR /opt/server
ADD package.json /opt/server/
ADD app/*.js /opt/server/app/

CMD ["npm", "run", "start"]
