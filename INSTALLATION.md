# Guia de Instalação Completo - DonAssistec

Este guia fornece instruções detalhadas para instalar e configurar o DonAssistec do zero.

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Passo a Passo](#instalação-passo-a-passo)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
5. [Executando a Aplicação](#executando-a-aplicação)
6. [Configuração Inicial](#configuração-inicial)
7. [Troubleshooting](#troubleshooting)

## 🖥 Requisitos do Sistema

### Mínimos

- **Sistema Operacional**: Linux (Ubuntu 20.04+), macOS, ou Windows 10+
- **RAM**: 4GB mínimo (8GB recomendado)
- **Disco**: 10GB de espaço livre
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **Docker**: v20.10.0 ou superior
- **Docker Compose**: v2.0.0 ou superior

### Verificar Instalações

```bash
# Verificar Node.js
node --version  # Deve ser >= 18.0.0

# Verificar npm
npm --version   # Deve ser >= 9.0.0

# Verificar Docker
docker --version
docker-compose --version
```

## 📥 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/donassistec.git
cd donassistec
```

### 2. Instalar Dependências do Backend

```bash
cd backend
npm install
```

Isso instalará todas as dependências necessárias para o backend.

### 3. Instalar Dependências do Frontend

```bash
cd ..
npm install
```

Isso instalará todas as dependências necessárias para o frontend.

### 4. Configurar Docker Compose

O projeto já vem com um `docker-compose.yml` configurado. Verifique se está correto:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: donassistec_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: donassistec_db
      MYSQL_USER: donassistec_user
      MYSQL_PASSWORD: donassistec_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### 5. Iniciar Banco de Dados

```bash
# Iniciar MySQL via Docker
docker-compose up -d mysql

# Verificar se está rodando
docker ps

# Ver logs (opcional)
docker-compose logs -f mysql
```

Aguarde alguns segundos para o MySQL inicializar completamente.

## 🗄 Configuração do Banco de Dados

### 1. Verificar Conexão

```bash
# Testar conexão
docker exec -it donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db

# Se funcionar, você verá o prompt MySQL. Digite:
exit
```

### 2. Importar Schema

```bash
# Importar schema principal
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/01_schema.sql

# Importar schema de conteúdo da home
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/03_home_content_schema.sql

# Importar schema de pedidos
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/04_orders_schema.sql

# Importar schema de autenticação
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/05_auth_schema.sql
```

### 3. Importar Dados Iniciais (Opcional)

```bash
# Dados de exemplo (seed)
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/02_seed_data.sql
```

### 4. Executar Migrations

Execute todas as migrations em ordem:

```bash
# Migration 6 até 20
for file in backend/database/migrations/*.sql; do
  docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < "$file"
done
```

## ⚙️ Configuração de Variáveis de Ambiente

### Backend (.env)

Crie o arquivo `backend/.env`:

```bash
cd backend
touch .env
nano .env  # ou use seu editor preferido
```

Adicione o seguinte conteúdo:

```env
# Porta do servidor
PORT=3001

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=donassistec_user
DB_PASSWORD=donassistec_password
DB_NAME=donassistec_db

# JWT Secret (GERE UM SECRET ÚNICO E SEGURO!)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_em_producao

# CORS
CORS_ORIGIN=http://localhost:8200

# Socket.IO
SOCKET_IO_PORT=3001

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**IMPORTANTE**: Gere um JWT_SECRET seguro:

```bash
# Linux/Mac
openssl rand -base64 32

# Ou use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Frontend (.env)

Crie o arquivo `.env` na raiz do projeto (opcional para desenvolvimento):

```bash
cd ..
touch .env
```

```env
# URL da API (opcional - detecta automaticamente)
VITE_API_URL=http://localhost:3001/api
```

## 🏃 Executando a Aplicação

### Modo Desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Servidor rodando na porta 3001
✅ Conectado ao banco de dados MySQL
```

#### Terminal 2 - Frontend

```bash
cd ..
npm run dev
```

Você deve ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8200/
```

### Modo Produção

#### 1. Build

```bash
# Build do backend
cd backend
npm run build

# Build do frontend
cd ..
npm run build
```

#### 2. Iniciar com PM2

```bash
# Instalar PM2 globalmente (se necessário)
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.cjs

# Salvar configuração
pm2 save

# Verificar status
pm2 status

# Ver logs
pm2 logs
```

## ⚡ Configuração Inicial

### 1. Acessar o Sistema

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 2. Criar Usuário Administrador

Se você importou os dados seed, você pode usar:

- **Email**: admin@donassistec.com
- **Senha**: admin123

**IMPORTANTE**: Altere a senha após o primeiro login!

### 3. Login Administrativo

1. Acesse: http://localhost:8200/admin/login
2. Faça login com as credenciais acima
3. Você será redirecionado para o Dashboard

### 4. Configurar Sistema

Após o login, acesse **Configurações** e configure:

- ✅ Informações da empresa
- ✅ Logo e favicon
- ✅ Informações de contato
- ✅ Mídias sociais
- ✅ Configurações de email (SMTP)
- ✅ Configurações de pagamento
- ✅ Outras configurações do sistema

## 🔧 Troubleshooting

### Problema: MySQL não inicia

**Solução:**
```bash
# Verificar logs
docker-compose logs mysql

# Remover container e volumes
docker-compose down -v

# Recriar
docker-compose up -d mysql
```

### Problema: Erro de conexão com banco

**Solução:**
1. Verifique se o MySQL está rodando: `docker ps`
2. Teste a conexão manualmente
3. Verifique as credenciais no `.env`
4. Certifique-se de que as portas não estão em uso

### Problema: Porta já em uso

**Solução:**
```bash
# Verificar o que está usando a porta
# Linux/Mac
lsof -i :3001
lsof -i :8200

# Matar processo (substitua PID)
kill -9 PID
```

### Problema: Erro de CORS

**Solução:**
1. Verifique `CORS_ORIGIN` no `.env` do backend
2. Certifique-se que corresponde à URL do frontend
3. Reinicie o backend após alterar

### Problema: Upload de imagens não funciona

**Solução:**
1. Verifique se a pasta `backend/uploads` existe
2. Verifique permissões da pasta
3. Verifique configuração CORS
4. Verifique tamanho máximo de arquivo

### Problema: Build falha

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Configure todas as configurações do sistema
2. ✅ Faça upload do logo e favicon
3. ✅ Configure informações de contato
4. ✅ Adicione marcas e modelos
5. ✅ Configure serviços
6. ✅ Crie usuários lojistas (ou permita registro)
7. ✅ Configure notificações
8. ✅ Revise configurações de segurança

## 📚 Documentação Adicional

- [README.md](./README.md) - Visão geral do projeto
- [DEPLOY.md](./DEPLOY.md) - Guia de deployment
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Guia do administrador
- [BACKEND_API.md](./BACKEND_API.md) - Documentação da API

---

**Dúvidas?** Entre em contato: suporte@donassistec.com.br
