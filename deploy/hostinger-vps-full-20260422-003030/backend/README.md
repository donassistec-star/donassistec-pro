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

> **Produção:** com domínio (ex.: donassistec.com.br), use `CORS_ORIGIN=https://donassistec.com.br`.

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

### Configurações (Settings)

```
GET /api/settings/public   - Configurações públicas (contato, branding, redes) — sem auth
GET /api/settings          - Todas as configurações (admin)
PUT /api/settings          - Atualizar configurações (admin)
GET /api/settings/history  - Histórico de alterações (admin)
```

### Tabela de preços (Price Table)

```
GET /api/price-table       - Modelos × serviços × preços (público)
GET /api/price-table?brand=:id  - Filtrado por marca (opcional)
```

### Pré-pedidos

```
GET  /api/pre-pedidos   - Listar pré-pedidos (admin)
POST /api/pre-pedidos   - Registrar pré-pedido (público, fluxo Finalizar)
```

O **POST** aceita opcionalmente: `contact_name`, `contact_company`, `contact_phone`, `contact_email`, `notes`, `is_urgent`, `retailer_id` (dados do formulário de finalização).

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

### Migrations

As migrations ficam em `database/migrations/`. Para o fluxo **pré-pedidos** (Finalizar e enviar pré-pedido):

```bash
cd backend

# 1. Tabela pre_pedidos (id, session_id, items_json, created_at)
npm run migrate:pre-pedidos

# 2. Campos de contato e observações (contact_name, contact_company, contact_phone, contact_email, notes, is_urgent, retailer_id)
npm run migrate:pre-pedidos-contact

# 3. need_by em pre_pedidos
npm run migrate:pre-pedidos-need-by

# 4. numero em pre_pedidos (PRE-0001, …)
npm run migrate:pre-pedidos-numero

# 5. numero e pre_pedido_id em orders (PED-0001, …)
npm run migrate:orders-numero

# 6. Tabela order_items (se não existir)
npm run migrate:order-items
```

Ou execute o conteúdo dos arquivos em `database/migrations/` no seu cliente MySQL.

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
