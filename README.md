## ToM: Cube Binary Server

Server that checks and updates code running remotely on NodeMCUs inside the cubes.

First it builds a binary using the checked out version of [tom-cube](https://github.com/thiagohersan/tom-cube), then it serves the binary using a simple nodejs+express file server.

--- 

- **Clone repo and submodules:**
```
git clone --recurse-submodules git@github.com:thiagohersan/tom-cube-binary-server.git
```

- **Copy** ```tom-cube/wifipass.h.example``` **to** ```tom-cube/wifipass.h``` **and change values for WiFi network name and password:**
```
#define WIFI "my-network"
#define PASS "my-password"
```

- **Set server addresses on** ```tom-cube/tom-cube.ino```**:**
```
String BINARY_SERVER_ADDRESS = "10.11.181.10";
...
String TREND_SERVER_ADDRESS = "10.11.181.10";
```

- **Build docker images:**
```
docker-compose build
```

- **Run docker services:**
```
docker-compose up
```
