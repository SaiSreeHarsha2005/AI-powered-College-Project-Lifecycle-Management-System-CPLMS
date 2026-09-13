# -------------------------------------------------------------
# Stage 1: Build the Spring Boot Artifact
# -------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# -------------------------------------------------------------
# Stage 2: Production JRE Lightweight Runtime
# -------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create unprivileged user for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Set permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# Production JVM flags for container awareness
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
