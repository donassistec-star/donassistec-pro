# Quick Start - DonAssistec

Guia rápido para começar a usar o DonAssistec em 5 minutos.

## 🚀 Início Rápido

### 1. Pré-requisitos

```bash
# Verificar Node.js (>= 18.0.0)
node --version

# Verificar Docker
docker --version

# Verificar Git
git --version
```

### 2. Clone o Repositório

```bash
git clone git@github.com:Ronei-rcm/donassistec.git
cd donassistec
```

### 3. Instalar Dependências

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
npm install
```

### 4. Configurar Banco de Dados

```bash
# Iniciar MySQL via Docker
docker-compose up -d mysql

# Aguardar MySQL inicializar (10-15 segundos)
sleep 15

# Importar schema principal
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/01_schema.sql
```

### 5. Configurar Variáveis de Ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Edite .env com suas configurações
nano .env  # ou use seu editor preferido
```

**Mínimo necessário no `.env`:**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=donassistec_user
DB_PASSWORD=donassistec_password
DB_NAME=donassistec_db
JWT_SECRET=seu_jwt_secret_aqui
CORS_ORIGIN=http://localhost:8200
```

### 6. Executar Aplicação

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 7. Acessar Aplicação

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 8. Login Inicial

**Admin:**
- URL: http://localhost:8200/admin/login
- Email: admin@donassistec.com (se dados seed importados)
- Senha: admin123 (altere após primeiro login!)

**Lojista:**
- URL: http://localhost:8200/lojista/login
- Faça registro ou use credenciais do seed

## ⚡ Próximos Passos

1. ✅ Configure o sistema em **Configurações** > **Branding**
2. ✅ Adicione seu logo e favicon
3. ✅ Configure informações de contato
4. ✅ Adicione marcas e modelos
5. ✅ Configure serviços

## 📚 Documentação Completa

Para instruções detalhadas, veja:
- [README.md](./README.md) - Visão geral completa
- [INSTALLATION.md](./INSTALLATION.md) - Guia de instalação detalhado
- [DEPLOY.md](./DEPLOY.md) - Guia de deployment
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Guia do administrador

## 🆘 Problemas?

Consulte [INSTALLATION.md](./INSTALLATION.md) na seção **Troubleshooting**.

---

**Tempo estimado**: 5-10 minutos
