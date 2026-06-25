FROM maven:3.9.9-eclipse-temurin-21 AS build

ARG SERVICE_DIR=iam-service

WORKDIR /build

# Build shared from the backend root context so all services can resolve com.example:shared.
COPY shared ./shared
RUN mvn -f shared/pom.xml clean install -DskipTests -B

# Copy the selected service from the same backend root context.
COPY ${SERVICE_DIR}/pom.xml ./${SERVICE_DIR}/pom.xml
RUN mvn -f ${SERVICE_DIR}/pom.xml dependency:go-offline -B

COPY ${SERVICE_DIR}/src ./${SERVICE_DIR}/src
RUN mvn -f ${SERVICE_DIR}/pom.xml clean package -DskipTests -B
RUN cp ${SERVICE_DIR}/target/*.jar /tmp/app.jar

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /tmp/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]