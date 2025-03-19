# Образ Java
FROM openjdk:21-jdk-alpine

# Рабочая директория
WORKDIR /app

# Копирование JAR-файла в контейнер
COPY /build network-device-manager.jar

# Открывает порт на котором работает приложение
EXPOSE 8080

# Запуск прилодения
ENTRYPOINT ["java", "-jar", "network-device-manager.jar"]