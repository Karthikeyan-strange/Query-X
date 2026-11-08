# ========================================================
# QueryX Spring Boot Backend - Multi-Stage Production Dockerfile
# Stage 1: Build JAR using Maven & Eclipse Temurin JDK 21
# Stage 2: Minimal Alpine JRE 21 Runtime Image
# ========================================================

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy project definition and resolve dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add a non-root group and user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy packaged JAR from builder stage
COPY --from=builder /build/target/queryx-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose default port
EXPOSE 8080

# Launch Spring Boot with dynamic Render $PORT binding
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
