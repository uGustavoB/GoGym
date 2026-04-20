FROM php:8.4-cli

# Definir como non-interactive para evitar prompts
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    dos2unix

# Limpar cache do apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões do PHP necessárias para o Laravel
# Dependendo da versão do docker-php-ext-install e da imagem, algumas extensões já podem estar embutidas.
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalar extensão do Redis via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Instalar o Composer (gerenciador de dependências do PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar diretório de trabalho padrão
WORKDIR /var/www/html

# Ajustar permissões para garantir que a pasta do projeto possa ser acessada/escrita caso necessário
RUN chown -R www-data:www-data /var/www/html
