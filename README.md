# DonAssistec - Sistema B2B de Gerenciamento de Peças e Serviços

Sistema completo de gerenciamento B2B para reconstrução de telas e revenda de peças para celulares. Plataforma web moderna desenvolvida com React, TypeScript, Node.js e MySQL.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API e Backend](#api-e-backend)
- [Deployment](#deployment)
- [Documentação Adicional](#documentação-adicional)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Visão Geral

DonAssistec é uma plataforma B2B completa para gerenciamento de catálogo de peças, pedidos, serviços e relacionamento com lojistas e assistências técnicas. O sistema oferece:

- Catálogo dinâmico de modelos de celulares e marcas
- Sistema de pedidos completo com múltiplos status
- Gerenciamento de serviços dinâmicos por modelo
- Dashboard administrativo com métricas e analytics
- Área do lojista com gestão de pedidos
- Sistema de tickets e suporte
- Notificações em tempo real
- Relatórios e exportação de dados
- Configurações de branding e identidade visual

## ✨ Funcionalidades

### Para Administradores

- ✅ Dashboard completo com métricas e gráficos
- ✅ Gerenciamento de marcas e modelos de celulares
- ✅ Gerenciamento de serviços dinâmicos
- ✅ Gestão de pedidos e status
- ✅ Pré-pedidos (lista, dados de contato, urgente, exportar CSV)
- ✅ Gerenciamento de lojistas
- ✅ Sistema de tickets e suporte
- ✅ Relatórios e exportação (PDF, Excel, TXT)
- ✅ Configurações completas do sistema
- ✅ Branding e identidade visual (logo, favicon, cores)
- ✅ Gerenciamento de contato e mídias sociais
- ✅ Sistema de cupons e preços dinâmicos
- ✅ Avaliações e reviews
- ✅ Logs de auditoria
- ✅ Gestão de conteúdo da home
- ✅ Controle de estoque
- ✅ Métricas de visualização de produtos

### Para Lojistas

- ✅ Dashboard personalizado
- ✅ Catálogo completo de produtos
- ✅ Pré-orçamento com finalização por WhatsApp (contato, observações, urgente)
- ✅ Favoritos e comparação de modelos
- ✅ Sistema de pedidos
- ✅ Acompanhamento de status
- ✅ Perfil e configurações
- ✅ Histórico de pedidos
- ✅ Suporte e tickets
- ✅ Relatórios básicos

### Público Geral

- ✅ Catálogo de produtos
- ✅ Tabela de Valores (preços por modelo e serviço, filtro por marca, exportar Excel)
- ✅ Detalhes de modelos com vídeos
- ✅ Comparação de produtos
- ✅ Busca avançada
- ✅ Recomendações personalizadas
- ✅ Sistema de favoritos

## 🛠 Tecnologias

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool moderna e rápida
- **React Router DOM** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **Shadcn UI** - Componentes UI modernos
- **Tailwind CSS** - Framework CSS utility-first
- **Recharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Notificações em tempo real
- **Lucide React** - Ícones
- **Sonner** - Notificações toast

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - TypeScript no backend
- **MySQL** - Banco de dados relacional
- **Socket.IO** - WebSockets para tempo real
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **Bcrypt** - Hash de senhas

### Infraestrutura

- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **PM2** - Gerenciador de processos
- **Nginx** - Proxy reverso e servidor web
- **MySQL (Docker)** - Banco de dados containerizado

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Gerenciador de pacotes
- **Docker** e **Docker Compose** - [Install Guide](https://docs.docker.com/get-docker/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/donassistec.git
cd donassistec
```

### 2. Configuração do Backend

```bash
cd backend
npm install
```

### 3. Configuração do Frontend

```bash
cd ..
npm install
```

### 4. Configuração do Banco de Dados

O banco de dados MySQL é executado via Docker Compose. Certifique-se de que o Docker está rodando:

```bash
# Iniciar banco de dados
docker-compose up -d mysql

# Verificar se o container está rodando
docker ps
```

### 5. Variáveis de Ambiente

#### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Porta do servidor
PORT=3001

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=donassistec_user
DB_PASSWORD=donassistec_password
DB_NAME=donassistec_db

# JWT Secret
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# CORS
CORS_ORIGIN=http://localhost:8200

# Socket.IO
SOCKET_IO_PORT=3001
```

#### Frontend (.env)

Crie um arquivo `.env` na raiz do projeto (opcional). O frontend detecta `localhost`, `donassistec.com.br` e `177.67.32.204` e define a URL da API automaticamente.

```env
# Opcional; override da URL da API
# VITE_API_URL=http://localhost:3001/api

# Desenvolvimento: acesso por IP (ex.: 177.67.32.204:8200) – HMR
# VITE_HMR_HOST=177.67.32.204
# VITE_USE_POLLING=1
```

## ⚙️ Configuração

### 1. Executar Migrations do Banco de Dados

```bash
# Acessar o container MySQL
docker exec -it donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db

# Ou executar migrations via script (se disponível)
# As migrations estão em: backend/database/migrations/
```

### 2. Criar Banco de Dados (se necessário)

```bash
docker exec -i donassistec_mysql mysql -u root -proot_password <<EOF
CREATE DATABASE IF NOT EXISTS donassistec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'donassistec_user'@'%' IDENTIFIED BY 'donassistec_password';
GRANT ALL PRIVILEGES ON donassistec_db.* TO 'donassistec_user'@'%';
FLUSH PRIVILEGES;
EOF
```

### 3. Importar Schema Inicial

```bash
# Importar schema inicial
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/01_schema.sql

# Importar dados seed (opcional)
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/02_seed_data.sql
```

## 🏃 Executando o Projeto

### Desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:8200`

### Produção

#### Usando PM2 (Recomendado)

```bash
# Build do backend
cd backend
npm run build

# Build do frontend
cd ..
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.cjs
pm2 save
```

#### Usando Docker

```bash
# Build e iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 📁 Estrutura do Projeto

```
donassistec/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   └── index.ts        # Entrada do servidor
│   ├── database/
│   │   ├── migrations/     # Migrations SQL
│   │   └── init/           # Scripts de inicialização
│   └── uploads/            # Uploads de arquivos
│
├── src/                     # Frontend React
│   ├── components/         # Componentes React
│   │   ├── admin/         # Componentes admin
│   │   ├── retailer/      # Componentes lojista
│   │   └── ui/            # Componentes UI reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── contexts/          # Contextos React
│   ├── services/          # Serviços API
│   ├── hooks/             # Custom hooks
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilitários
│
├── public/                 # Arquivos estáticos
├── database/              # Scripts de banco
└── docker-compose.yml     # Configuração Docker
```

## 🔌 API e Backend

### Endpoints Principais

- **Autenticação**: `/api/auth/*`
- **Marcas**: `/api/brands/*`
- **Modelos**: `/api/models/*`
- **Pedidos**: `/api/orders/*`
- **Lojistas**: `/api/retailers/*`
- **Configurações**: `/api/settings/*` (GET `/api/settings/public` é **público**, sem login)
- **Tabela de preços**: `/api/price-table` (público, `?brand=id` opcional)
- **Upload**: `/api/upload/*`
- **Serviços**: `/api/services/*`
- **Visualizações**: `/api/product-views/*`
- **Conteúdo da home**: `/api/home-content` (GET público)

Para documentação completa da API, veja [BACKEND_API.md](./BACKEND_API.md) e [API_ROUTES.md](./API_ROUTES.md)

## 🚢 Deployment

Veja o guia completo de deployment em [DEPLOY.md](./DEPLOY.md)

### Resumo Rápido

1. Configure as variáveis de ambiente em produção (incl. `CORS_ORIGIN` para o domínio)
2. Build do frontend: `npm run build`
3. Build do backend: `cd backend && npm run build`
4. Use PM2 para gerenciar processos: `pm2 start ecosystem.config.cjs` (ou `ecosystem.production.config.cjs`)
5. Configure Nginx como proxy reverso (use `nginx-vps.conf` em VPS; porta 80 → frontend :8200, `/api` e `/uploads` → backend :3001)
6. Libere portas 80 e 443 no firewall (firewalld/UFW)
7. Configure SSL/HTTPS (recomendado em produção)

## 📚 Documentação Adicional

- [API_ROUTES.md](./API_ROUTES.md) - Rotas da API (incl. `/api/settings/public`, `/api/price-table`)
- [BACKEND_API.md](./BACKEND_API.md) - Documentação da API (marcas, modelos, configurações, tabela de preços)
- [DEPLOY.md](./DEPLOY.md) - Guia de deployment (Docker, VPS com Nginx `nginx-vps.conf`, firewall, domínio)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Guia do administrador
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Configuração Docker
- [PM2_SETUP.md](./PM2_SETUP.md) - Configuração PM2 (rebuild do backend, CORS, Nginx)
- [DATABASE_CONFIG.md](./DATABASE_CONFIG.md) - Configuração do banco

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido com ❤️ pela equipe DonAssistec

## 📞 Suporte

Para suporte, entre em contato através:
- Email: suporte@donassistec.com.br
- WhatsApp: (11) 99999-9999

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026
