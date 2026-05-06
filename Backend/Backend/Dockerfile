FROM docker.io/library/eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:resolve
COPY src ./src
RUN ./mvnw package -DskipTests

FROM docker.io/library/eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
