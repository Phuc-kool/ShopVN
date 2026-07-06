# ============================================
# STAGE 1 — Build
# ============================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml trước để cache dependencies (build nhanh hơn ở lần sau)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests

# ============================================
# STAGE 2 — Run (image nhẹ, chỉ có JRE)
# ============================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy jar đã build từ stage 1
COPY --from=build /app/target/*.jar app.jar

# Thư mục lưu ảnh upload — mount volume vào đây
RUN mkdir -p /app/uploads/images

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
