FROM node:4.8.7-wheezy

RUN dpkg --add-architecture armhf
RUN apt-get update

RUN apt-get install -y arduino-core
## RUN apt-get install -y arduino-core:armhf

ADD . /opt/server/

WORKDIR /opt/server/build/tom-cube/
RUN git checkout -- *
RUN git pull origin master
RUN printf "String TREND = \"1\";\nString BINARY_VERSION = \"`git rev-parse HEAD`\";\n" > parameters.h

WORKDIR /opt/server/build/esp8266/tools/
RUN python get.py

WORKDIR /opt/server/build/

RUN make -f ./makeEspArduino/makeEspArduino.mk ESP_ROOT=./esp8266 SKETCH=./tom-cube/tom-cube.ino CUSTOM_LIBS=./libraries EXCLUDE_DIRS=./libraries/Adafruit_NeoPixel/examples BUILD_ROOT=./mkESP

RUN cp ./mkESP/tom-cube_generic/tom-cube.bin ./tom-cube/bin/

WORKDIR /opt/server/
CMD ["npm", "run", "start"]
