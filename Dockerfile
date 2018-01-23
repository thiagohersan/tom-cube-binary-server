FROM node:4.8.7-stretch

ENV GIT_URL https://github.com/thiagohersan/tom-cube

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && cp -a /tmp/node_modules /opt/server/

RUN mkdir -p /opt/server/bin
WORKDIR /opt/server/bin

RUN curl -Ls -H 'Accept: application/json' $GIT_URL/releases/latest | \
    sed -e 's/.*"tag_name":"\([^"]*\)".*/\1/' > /tmp/LATEST_RELEASE

RUN LATEST_RELEASE=$(cat /tmp/LATEST_RELEASE) && \
    curl -Os $GIT_URL/releases/download/$LATEST_RELEASE/tom-cube.bin

WORKDIR /opt/server

RUN git ls-remote https://github.com/thiagohersan/tom-cube.git | \
    grep refs/heads/master | cut -f 1 > /tmp/LATEST_COMMIT_HASH

RUN echo "LATEST_COMMIT_HASH=$(cat /tmp/LATEST_COMMIT_HASH)" > .env

ADD . /opt/server

CMD ["npm", "run", "start"]
