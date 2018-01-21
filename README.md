## ToM: Cube Binary Server

Server that checks and updates code running remotely on NodeMCUs inside the cubes.

First it builds a binary using the checked out version of [tom-cube](https://github.com/thiagohersan/tom-cube), then it serves the binary using a simple nodejs+express file server.


## Clone
#### Clone repo and submodules:
```
git clone --recurse-submodules
```

#### Set WiFi network and password on tom-cube/wifipass.h
```
#define WIFI "my-network"
#define PASS "my-password"
```


## Build
#### Build docker images:
```
docker-compose build
```

## Run
#### Run docker services:
```
docker-compose up
```
