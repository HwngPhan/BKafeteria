# ✅ Requirements

| Tool | Version |
|------|---------|
| **Java** | 21 |
| **Maven** | 3.8+ |
| **Redis** | Latest |
| **PostgreSQL** |17+ |
| **Git** | Any |

# 1. Clone the repository

```sh
git clone https://github.com/HwngPhan/BKafeteria
cd .\backend

```
# 2. Create and configure .env file

- Create a .env file in folder **backend** using **example.env** template

# 3. Setup redis container in docker desktop

- Open terminal or Window PowerShell, run:
```sh
  docker run --name redis \
  -p 6379:6379 \
  -d redis
```
- Check whether Redis is running or not:
```sh
docker ps
```
You will see Redis is running:
```text
CONTAINER ID   IMAGE    COMMAND     PORTS           NAMES
abc12345       redis    ...         0.0.0.0:6379     redis
```
- Check if Reddis is working properly using PING PONG:
```sh
bash
docker exec -it redis redis-cli
```
# 4. Build the project:
- Open terminal
```sh
cd .\shared
mvn clean install
```
- Open another terminal
```sh
cd .\{service}
mvn spring-boot:run
```
