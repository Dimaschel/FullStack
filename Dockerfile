FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN groupadd --system spring \
    && useradd --system --gid spring spring
COPY target/*.jar app.jar

USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
