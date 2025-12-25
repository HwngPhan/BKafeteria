## ---------- BUILD ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

# 1. Install Shared Module
COPY shared /build/shared
RUN mvn -f shared/pom.xml clean install -DskipTests -B

# 2. Dependency Caching (The Major Fix)
WORKDIR /build/api-gateway

COPY api-gateway/pom.xml .
RUN mvn dependency:go-offline -B

# 3. Build Application
COPY api-gateway/src ./src
RUN mvn clean package -DskipTests -B

## ---------- RUN ----------
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app
COPY --from=build /build/api-gateway/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]