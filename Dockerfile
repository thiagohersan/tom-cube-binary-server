FROM node:4.8.7-wheezy

ADD . /opt/server/
WORKDIR /opt/server/

CMD ["npm", "run", "start"]
