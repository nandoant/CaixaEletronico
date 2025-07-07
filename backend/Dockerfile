# Dockerfile multi-estágio para otimização
FROM openjdk:17-jdk-slim as builder

# Instalar Maven
RUN apt-get update && apt-get install -y maven

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Maven
COPY pom.xml .
COPY src ./src

# Construir a aplicação
RUN mvn clean package -DskipTests

# Estágio final - imagem de produção
FROM eclipse-temurin:17-jre-jammy

# Criar usuário não-root
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Definir diretório de trabalho
WORKDIR /app

# Copiar o JAR construído do estágio anterior
COPY --from=builder /app/target/*.jar app.jar

# Alterar proprietário do arquivo
RUN chown spring:spring app.jar

# Mudar para usuário não-root
USER spring

# Expor porta
EXPOSE 8080

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
