# 🚀 Backend API DonAssistec

API REST desenvolvida em Node.js/Express/TypeScript para gerenciar o catálogo de modelos de celulares.

## 📋 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ Docker e Docker Compose rodando
- ✅ Banco de dados MySQL configurado (via docker-compose)

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já foi criado com as configurações corretas:

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

### 3. Iniciar o Servidor

**Desenvolvimento (com hot reload):**
```bash
cd backend
npm run dev
```

**Produção:**
```bash
cd backend
npm run build
npm start
```

A API estará disponível em: **http://localhost:3001**

## 📚 Endpoints da API

### Health Check

```http
GET /health
```

**Resposta:**
```json
{
  "success": true,
  "message": "API está funcionando e conectada ao banco de dados",
  "timestamp": "2025-01-20T04:40:00.000Z"
}
```

### 🔹 Marcas (Brands)

#### Listar todas as marcas
```http
GET /api/brands
```

#### Buscar marca por ID
```http
GET /api/brands/:id
```

#### Criar nova marca
```http
POST /api/brands
Content-Type: application/json

{
  "id": "nova-marca",
  "name": "Nova Marca",
  "logo_url": "https://...",
  "icon_name": "NovaMarcaIcon"
}
```

#### Atualizar marca
```http
PUT /api/brands/:id
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "logo_url": "https://..."
}
```

#### Deletar marca
```http
DELETE /api/brands/:id
```

### 📱 Modelos (Phone Models)

#### Listar todos os modelos
```http
GET /api/models
```

#### Buscar modelo por ID
```http
GET /api/models/:id
```

#### Buscar modelos por marca
```http
GET /api/models/brand/:brandId
```

#### Criar novo modelo
```http
POST /api/models
Content-Type: application/json

{
  "id": "novo-modelo",
  "brand_id": "apple",
  "name": "Novo Modelo",
  "image_url": "https://...",
  "video_url": "https://...",
  "availability": "in_stock",
  "premium": false,
  "popular": true
}
```

#### Atualizar modelo
```http
PUT /api/models/:id
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "availability": "in_stock"
}
```

#### Deletar modelo
```http
DELETE /api/models/:id
```

### 🔍 Query Parameters para Filtros

#### Buscar modelos
```http
GET /api/models?search=iphone
```

#### Filtrar por marca
```http
GET /api/models?brand=apple
GET /api/models?brand=apple&brand=samsung
```

#### Filtrar por disponibilidade
```http
GET /api/models?availability=in_stock
GET /api/models?availability=in_stock&availability=order
```

#### Filtrar modelos premium
```http
GET /api/models?premium=true
```

#### Filtrar modelos populares
```http
GET /api/models?popular=true
```

#### Filtrar por serviço
```http
GET /api/models?service=reconstruction
GET /api/models?service=reconstruction&service=glassReplacement
```

#### Múltiplos filtros combinados
```http
GET /api/models?brand=apple&premium=true&availability=in_stock&popular=true
```

### ⚙️ Configurações

#### Configurações públicas (sem autenticação)
```http
GET /api/settings/public
```
Retorna contato, branding, redes sociais etc. para Header, Footer e páginas públicas.

#### Configurações completas (admin)
```http
GET /api/settings
Authorization: Bearer <token>
```

### 📊 Tabela de preços pública

```http
GET /api/price-table?brand=apple
```

Tabela pública usada na vitrine geral, com filtro opcional por marca.

### 🧾 Tabelas de preços para lojistas

Módulo exclusivo para lojistas autenticados e administradores. Suporta múltiplas tabelas, destaque, ordenação manual, importação via texto bruto/`.txt`, preview estruturado e exportação.

#### Listar tabelas visíveis para lojistas
```http
GET /api/retailer-price-tables/retailer
Authorization: Bearer <token>
```

#### Buscar uma tabela visível por slug
```http
GET /api/retailer-price-tables/retailer/:slug
Authorization: Bearer <token>
```

#### Listar tabelas no admin
```http
GET /api/retailer-price-tables/admin
Authorization: Bearer <token>
```

#### Buscar tabela no admin por slug
```http
GET /api/retailer-price-tables/admin/:slug
Authorization: Bearer <token>
```

#### Salvar ou atualizar tabela no admin
```http
PUT /api/retailer-price-tables/admin/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tabela dos Vidros",
  "effectiveDate": "13/11/25",
  "visibleToRetailers": true,
  "featuredToRetailers": false,
  "rawText": "TABELA DOS VIDROS: 13/11/25\n..."
}
```

Observações:
- O backend aceita salvar a tabela mesmo se o banco ainda não tiver recebido as migrations de versionamento (`35_retailer_price_tables_versioning.sql` e `36_retailer_price_tables_history.sql`).
- Nesses ambientes legados, o `PUT` continua persistindo `title`, `effectiveDate`, visibilidade, destaque, `rawText`, `parsed_data` e `service_templates`, mas os metadados de versão/histórico só ficam disponíveis após as migrations.

#### Reordenar tabelas no admin
```http
POST /api/retailer-price-tables/admin/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "slugs": ["tabela-vidros", "tabela-traseiros", "apple-watch"]
}
```

#### Remover tabela no admin
```http
DELETE /api/retailer-price-tables/admin/:slug
Authorization: Bearer <token>
```

**Resposta pública legada (`/api/price-table`)**: retorna `{ services, models }` com preços por modelo e serviço. Query `brand` opcional.

## 📦 Estrutura da Resposta

Todas as respostas seguem o formato:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Exemplo de sucesso:**
```json
{
  "success": true,
  "data": [...]
}
```

**Exemplo de erro:**
```json
{
  "success": false,
  "error": "Modelo não encontrado"
}
```

## 🧪 Testando a API

### 1. Verificar se está funcionando

```bash
curl http://localhost:3001/health
```

### 2. Listar marcas

```bash
curl http://localhost:3001/api/brands
```

### 3. Listar modelos

```bash
curl http://localhost:3001/api/models
```

### 4. Buscar modelo específico

```bash
curl http://localhost:3001/api/models/iphone-15-pro-max
```

### 5. Filtrar modelos

```bash
curl "http://localhost:3001/api/models?brand=apple&premium=true"
```

### 6. Buscar modelos

```bash
curl "http://localhost:3001/api/models?search=galaxy"
```

## 🔌 Integração com Frontend

Para conectar o frontend React à API, você precisará:

1. **Instalar biblioteca de HTTP client:**
```bash
cd /home/DonAssistec
npm install axios
```

2. **Criar serviço de API:**
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export default api;
```

3. **Usar nos componentes:**
```typescript
import api from '@/services/api';

const fetchModels = async () => {
  const response = await api.get('/models');
  return response.data.data;
};
```

## 🐛 Troubleshooting

### Erro: Cannot connect to database

1. Verifique se o Docker está rodando:
```bash
docker-compose ps
```

2. Verifique se o banco está acessível:
```bash
docker exec -it donassistec_mysql mysql -u root -prootpassword donassistec_db
```

3. Verifique as credenciais no arquivo `.env`

### Porta 3001 já em uso

Altere a porta no arquivo `.env`:
```env
PORT=3002
```

### Erro de CORS

Verifique o `CORS_ORIGIN` no `backend/.env`:
```env
CORS_ORIGIN=http://localhost:8200
```
Em produção com domínio: `CORS_ORIGIN=https://donassistec.com.br`. O backend já inclui `donassistec.com.br`, `www.donassistec.com.br` e `177.67.32.204` em `allowedOrigins`.

## 📊 Status da API

A API fornece um endpoint `/health` que retorna:
- Status da conexão com o banco de dados
- Timestamp da verificação
- Mensagem de status

Use este endpoint para monitoramento e health checks.

## 🔒 Segurança

⚠️ **ATENÇÃO:** Esta é uma API de desenvolvimento. Para produção:

- [ ] Implementar autenticação/autorização (JWT)
- [ ] Validar todas as entradas
- [ ] Implementar rate limiting
- [ ] Configurar HTTPS
- [ ] Usar variáveis de ambiente para secrets
- [ ] Implementar logs de auditoria
- [ ] Configurar firewall

## 📝 Próximos Passos

1. ✅ API criada e funcional
2. ⏳ Conectar frontend à API
3. ⏳ Implementar autenticação
4. ⏳ Adicionar endpoints para área do lojista
5. ⏳ Implementar upload de imagens
6. ⏳ Adicionar cache (Redis)
