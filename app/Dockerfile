# Nome da Imagem a ser baixada
FROM node:23.11.0-slim

# Atualizando o Sistema e Instalando o OpenSSL
RUN apt update && \
apt-get install -y openssl

RUN npm i -g pnpm

# Instanciado o usuário node
USER node

# Diretorio de trabalho
WORKDIR /home/node/app

# Porta de execução
EXPOSE 3000

# Comando de execução
CMD [ "tail", "-f", "/dev/null" ]