## ---------- BUILD ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

# 1. Install Shared Module
COPY shared /build/shared
RUN mvn -f shared/pom.xml clean install -DskipTests -B

# 2. Dependency Caching (The Major Fix)
WORKDIR /build/order-service

COPY order-service/pom.xml .
RUN mvn dependency:go-offline -B

# 3. Build Application
COPY order-service/src ./src
RUN mvn clean package -DskipTests -B

## ---------- RUN ----------
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app
COPY --from=build /build/order-service/target/*.jar app.jar

EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar"]