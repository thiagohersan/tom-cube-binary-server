## ToM: Cube Binary Server

Server that checks and updates code running remotely on NodeMCUs inside the cubes.

First it builds a binary using the checked out version of [tom-cube](https://github.com/thiagohersan/tom-cube), then it serves the binary using a simple nodejs+express file server.

--- 

1. **Clone repo:**
```
git clone https://github.com/thiagohersan/tom-cube-binary-server.git
```

2. **Build docker images:**
```
docker-compose build
```

3. **Run docker services:**
```
docker-compose up
```
