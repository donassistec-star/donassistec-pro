# Backend API DonAssistec

API REST desenvolvida em Node.js/Express/TypeScript para gerenciar o catálogo de modelos de celulares.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **MySQL2** - Driver MySQL
- **CORS** - Controle de acesso

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose rodando
- Banco de dados MySQL configurado (via docker-compose)

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do banco de dados:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3307
DB_NAME=donassistec_db
DB_USER=donassistec_user
DB_PASSWORD=donassistec_password

CORS_ORIGIN=http://localhost:8200
```

### 3. Iniciar o servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## 📚 Endpoints da API

### Health Check

```
GET /health
```

Verifica se a API está funcionando e conectada ao banco de dados.

### Marcas (Brands)

```
GET    /api/brands        - Listar todas as marcas
GET    /api/brands/:id    - Buscar marca por ID
POST   /api/brands        - Criar nova marca
PUT    /api/brands/:id    - Atualizar marca
DELETE /api/brands/:id    - Deletar marca
```

### Modelos (Phone Models)

```
GET    /api/models                    - Listar todos os modelos
GET    /api/models/:id                - Buscar modelo por ID
GET    /api/models/brand/:brandId     - Buscar modelos por marca
POST   /api/models                    - Criar novo modelo
PUT    /api/models/:id                - Atualizar modelo
DELETE /api/models/:id                - Deletar modelo
```

#### Query Parameters para /api/models

- `search` - Buscar por nome, marca ou ID
- `brand` - Filtrar por marca(s)
- `availability` - Filtrar por disponibilidade (in_stock, order, out_of_stock)
- `premium` - Filtrar modelos premium (true/false)
- `popular` - Filtrar modelos populares (true/false)
- `service` - Filtrar por serviço (reconstruction, glassReplacement, partsAvailable)
- `sortBy` - Ordenar por (popular, name, brand)

**Exemplos:**

```
GET /api/models?brand=apple&premium=true
GET /api/models?search=iphone
GET /api/models?availability=in_stock&popular=true
GET /api/models?service=reconstruction&service=glassReplacement
```

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (database, etc)
│   ├── controllers/     # Lógica dos controllers
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── types/           # Tipos TypeScript
│   └── index.ts         # Arquivo principal
├── dist/                # Build de produção
├── .env                 # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Conexão com o Banco de Dados

A API se conecta ao MySQL na porta `3307` (configurada para evitar conflitos com outros projetos).

Certifique-se de que o Docker Compose está rodando:

```bash
cd /home/DonAssistec
docker-compose up -d
```

## 📝 Exemplos de Uso

### Listar todas as marcas

```bash
curl http://localhost:3001/api/brands
```

### Listar todos os modelos

```bash
curl http://localhost:3001/api/models
```

### Buscar modelo por ID

```bash
curl http://localhost:3001/api/models/iphone-15-pro-max
```

### Filtrar modelos por marca

```bash
curl http://localhost:3001/api/models?brand=apple
```

### Buscar modelos

```bash
curl http://localhost:3001/api/models?search=galaxy
```

## 🐛 Troubleshooting

### Erro de conexão com o banco

1. Verifique se o Docker está rodando:
```bash
docker-compose ps
```

2. Verifique se o banco está acessível:
```bash
curl http://localhost:3001/health
```

3. Verifique as credenciais no arquivo `.env`

### Porta já em uso

Se a porta 3001 estiver em uso, altere no arquivo `.env`:

```env
PORT=3002
```

## 🔒 Segurança

⚠️ **ATENÇÃO:** Esta é uma API de desenvolvimento. Para produção:

- Implemente autenticação/autorização
- Use variáveis de ambiente para secrets
- Configure HTTPS
- Implemente rate limiting
- Valide todas as entradas
- Use prepared statements (já implementado)
