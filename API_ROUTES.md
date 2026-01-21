# Documentação de Rotas da API - DonAssistec

Todas as rotas da API REST do DonAssistec.

**Base URL**: `http://localhost:3001/api` (desenvolvimento)  
**Produção**: `http://seu-servidor:3001/api`

## 📋 Índice

- [Autenticação](#autenticação)
- [Marcas](#marcas)
- [Modelos](#modelos)
- [Pedidos](#pedidos)
- [Lojistas](#lojistas)
- [Configurações](#configurações)
- [Serviços](#serviços)
- [Upload](#upload)
- [Visualizações](#visualizações)
- [Cupons](#cupons)
- [Avaliações](#avaliações)
- [Tickets](#tickets)
- [Preços Dinâmicos](#preços-dinâmicos)
- [Logs de Auditoria](#logs-de-auditoria)
- [Conteúdo da Home](#conteúdo-da-home)

---

## 🔐 Autenticação

### POST `/api/auth/login`
Login de administrador ou lojista.

**Body:**
```json
{
  "email": "admin@donassistec.com",
  "password": "senha123",
  "role": "admin" // ou "retailer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### POST `/api/auth/register`
Registro de novo lojista.

**Body:**
```json
{
  "email": "lojista@email.com",
  "password": "senha123",
  "companyName": "Nome da Empresa",
  "contactName": "Nome do Contato",
  "phone": "(11) 99999-9999",
  "cnpj": "00.000.000/0000-00"
}
```

---

## 🏷 Marcas

### GET `/api/brands`
Lista todas as marcas (público).

### GET `/api/brands/:id`
Detalhes de uma marca (público).

### POST `/api/brands`
Criar nova marca (admin).

### PUT `/api/brands/:id`
Atualizar marca (admin).

### DELETE `/api/brands/:id`
Deletar marca (admin).

---

## 📱 Modelos

### GET `/api/models`
Lista todos os modelos (público).

**Query Params:**
- `brandId`: Filtrar por marca
- `search`: Busca por nome
- `availability`: Filtrar por disponibilidade

### GET `/api/models/:id`
Detalhes de um modelo (público).

### GET `/api/models/brand/:brandId`
Modelos por marca (público).

### POST `/api/models`
Criar novo modelo (admin).

### PUT `/api/models/:id`
Atualizar modelo (admin).

### DELETE `/api/models/:id`
Deletar modelo (admin).

---

## 📦 Pedidos

### GET `/api/orders`
Lista pedidos (autenticado).
- Admin: Todos os pedidos
- Lojista: Apenas seus pedidos

### GET `/api/orders/:id`
Detalhes de um pedido (autenticado).

### POST `/api/orders`
Criar novo pedido (lojista).

### PUT `/api/orders/:id/status`
Atualizar status do pedido (admin).

---

## 👥 Lojistas

### GET `/api/retailers`
Lista todos os lojistas (admin).

### GET `/api/retailers/:id`
Detalhes de um lojista (admin).

### PUT `/api/retailers/:id/status`
Atualizar status do lojista (admin).

---

## ⚙️ Configurações

### GET `/api/settings`
Obter todas as configurações (admin).

### PUT `/api/settings`
Atualizar configurações (admin).

### GET `/api/settings/history`
Histórico de mudanças nas configurações (admin).

**Query Params:**
- `settingKey`: Filtrar por chave específica
- `limit`: Limite de resultados (padrão: 50)

---

## 🔧 Serviços

### GET `/api/services`
Lista todos os serviços (público).

### GET `/api/services/:id`
Detalhes de um serviço (público).

### POST `/api/services`
Criar novo serviço (admin).

### PUT `/api/services/:id`
Atualizar serviço (admin).

### DELETE `/api/services/:id`
Deletar serviço (admin).

### GET `/api/services/model/:modelId`
Serviços de um modelo específico (público).

### POST `/api/services/model/:modelId/:serviceId`
Associar serviço a modelo com preço (admin).

**Body:**
```json
{
  "price": 150.00,
  "available": true
}
```

### DELETE `/api/services/model/:modelId/:serviceId`
Remover serviço de modelo (admin).

---

## 📤 Upload

### POST `/api/upload/image`
Upload de imagem (admin).

**Form Data:**
- `image`: Arquivo de imagem (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "image-xxx.jpg",
    "url": "/uploads/image-xxx.jpg",
    "size": 123456
  }
}
```

---

## 👁 Visualizações

### POST `/api/product-views`
Registrar visualização de produto (público).

**Body:**
```json
{
  "modelId": "iphone-15-pro",
  "userId": "user_id_optional"
}
```

### GET `/api/product-views/model/:modelId/stats`
Estatísticas de visualização de um modelo (público).

### GET `/api/product-views/most-viewed`
Produtos mais visualizados (público).

**Query Params:**
- `limit`: Número de resultados (padrão: 10)

### GET `/api/product-views/history`
Histórico de visualizações do usuário (autenticado).

---

## 🎫 Cupons

### GET `/api/coupons`
Lista todos os cupons (admin).

### GET `/api/coupons/:id`
Detalhes de um cupom (admin).

### POST `/api/coupons`
Criar novo cupom (admin).

### PUT `/api/coupons/:id`
Atualizar cupom (admin).

### DELETE `/api/coupons/:id`
Deletar cupom (admin).

### POST `/api/coupons/validate`
Validar cupom (público).

**Body:**
```json
{
  "code": "DESCONTO10",
  "orderValue": 1000.00
}
```

---

## ⭐ Avaliações

### GET `/api/reviews`
Lista avaliações (público).

### GET `/api/reviews/:id`
Detalhes de uma avaliação (público).

### POST `/api/reviews`
Criar nova avaliação (autenticado).

### PUT `/api/reviews/:id`
Atualizar avaliação (autenticado/owner).

### DELETE `/api/reviews/:id`
Deletar avaliação (admin).

---

## 🎫 Tickets

### GET `/api/tickets`
Lista tickets (autenticado).
- Admin: Todos os tickets
- Lojista: Apenas seus tickets

### GET `/api/tickets/:id`
Detalhes de um ticket (autenticado).

### POST `/api/tickets`
Criar novo ticket (autenticado).

### POST `/api/tickets/:id/reply`
Responder a um ticket (autenticado).

---

## 💰 Preços Dinâmicos

### GET `/api/dynamic-pricing`
Lista preços dinâmicos (admin).

### POST `/api/dynamic-pricing`
Criar preço dinâmico (admin).

### PUT `/api/dynamic-pricing/:id`
Atualizar preço dinâmico (admin).

### DELETE `/api/dynamic-pricing/:id`
Deletar preço dinâmico (admin).

---

## 📋 Logs de Auditoria

### GET `/api/audit-logs`
Lista logs de auditoria (admin).

**Query Params:**
- `userId`: Filtrar por usuário
- `action`: Filtrar por ação
- `startDate`: Data inicial
- `endDate`: Data final
- `limit`: Limite de resultados

---

## 🏠 Conteúdo da Home

### GET `/api/home-content`
Obter conteúdo da home (público).

### PUT `/api/home-content`
Atualizar conteúdo da home (admin).

---

## 🔒 Autenticação

Todas as rotas protegidas requerem:

**Header:**
```
Authorization: Bearer <jwt_token>
```

### Roles

- **admin**: Acesso completo ao sistema
- **retailer**: Acesso à área do lojista

### Códigos de Resposta

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro do servidor

---

Para documentação mais detalhada, veja [BACKEND_API.md](./BACKEND_API.md)
