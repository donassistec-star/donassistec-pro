# CMS da Home - Backend Integrado

## Status atual

O CMS da home está integrado entre banco, backend e frontend.

- Banco: tabela `home_content` com JSON por seção
- Backend: API pública para leitura e API protegida para atualização
- Frontend: contexto centralizado com fallback para `localStorage`
- Admin atual: `/admin/home-content`

## O que existe no código

### Banco de dados

Arquivo de schema: `database/init/03_home_content_schema.sql`

A tabela `home_content` armazena:

- `section` como chave única
- `content` como `JSON`
- `created_at` e `updated_at`

O seed inicial insere a seção `main` com conteúdo padrão da home.

### Backend

Arquivos principais:

- `backend/src/models/HomeContentModel.ts`
- `backend/src/controllers/HomeContentController.ts`
- `backend/src/routes/homeContent.ts`
- `backend/src/index.ts`

Rotas montadas em `backend/src/index.ts`:

- `GET /api/home-content`
- `PUT /api/home-content`

Comportamento atual:

- `GET` é público
- `PUT` exige `authenticateToken` + `requireAdmin`
- se a linha `section = 'main'` não existir, o `GET` retorna `404`
- o `PUT` faz validação básica de campos obrigatórios antes de salvar
- o model usa `INSERT ... ON DUPLICATE KEY UPDATE`

### Frontend

Arquivos principais:

- `src/services/homeContentService.ts`
- `src/contexts/HomeContentContext.tsx`
- `src/pages/admin/HomeContentAdmin.tsx`
- `src/App.tsx`

Comportamento atual:

- o contexto tenta buscar primeiro da API
- se a API falhar ou estiver indisponível, usa `localStorage`
- ao salvar, tenta persistir na API e mantém `localStorage` como backup
- URLs de mídia são normalizadas no serviço
- a tela administrativa exposta hoje no app é `/admin/home-content`

## Fluxo

```text
Admin HomeContent
  -> HomeContentContext
  -> homeContentService
  -> /api/home-content
  -> HomeContentController
  -> HomeContentModel
  -> MySQL (home_content)
```

## Estrutura de conteúdo

O tipo atual de `HomeContent` é mais amplo do que a primeira versão do CMS. Hoje ele inclui, além de hero, features, stats e process:

- flags de visibilidade por seção
- imagens da hero e da seção de serviços
- links e toggles de CTA
- seção de serviços com `servicesCards` e `servicesHighlights`
- marcas exibidas na home via `homeBrandIds`

Campos centrais do payload atual:

```json
{
  "showHero": true,
  "showBrands": true,
  "homeBrandIds": [],
  "showServices": true,
  "showFeatures": true,
  "showStats": true,
  "showProcess": true,
  "showTestimonials": true,
  "showDifferentials": true,
  "showCta": true,
  "heroBadge": "Laboratório Premium B2B",
  "heroTitle": "...",
  "heroSubtitle": "...",
  "heroImage": null,
  "showHeroPrimaryCta": true,
  "showHeroSecondaryCta": true,
  "heroCtaLabel": "...",
  "heroCtaLink": "/catalogo",
  "heroSecondaryCtaLabel": "...",
  "heroSecondaryCtaLink": "/lojista/login",
  "servicesBadge": "...",
  "servicesTitle": "...",
  "servicesSubtitle": "...",
  "servicesImage": null,
  "servicesImageTitle": "...",
  "servicesImageDescription": "...",
  "servicesCards": [],
  "servicesHighlights": [],
  "featuresTitle": "...",
  "featuresSubtitle": "...",
  "features": [],
  "statsTitle": "...",
  "statsSubtitle": "...",
  "stats": [],
  "processTitle": "...",
  "processSubtitle": "...",
  "steps": []
}
```

## Como usar

### 1. Garantir schema no banco

```bash
docker exec -i donassistec_mysql mysql -u donassistec_user -pdonassistec_password donassistec_db < database/init/03_home_content_schema.sql
```

Se o ambiente sobe o banco a partir dos scripts de init, reiniciar os containers também resolve.

### 2. Subir o backend

```bash
cd backend
npm run dev
```

### 3. Acessar o CMS

1. Entrar em `http://localhost:8200/admin/login`
2. Abrir `http://localhost:8200/admin/home-content`
3. Editar o conteúdo
4. Salvar para persistir no MySQL

## Contrato da API

### `GET /api/home-content`

- uso público
- retorno `200` com `data` quando existe conteúdo
- retorno `404` quando a seção `main` ainda não existe

Exemplo de resposta:

```json
{
  "success": true,
  "data": {
    "heroTitle": "Reconstrução de Telas e Peças Premium para Lojistas"
  }
}
```

### `PUT /api/home-content`

- uso restrito a admin autenticado
- body: objeto completo `HomeContent`
- retorno `400` se faltarem campos obrigatórios básicos

Exemplo de resposta:

```json
{
  "success": true,
  "data": {},
  "message": "Conteúdo atualizado com sucesso"
}
```

## Observações importantes

- o documento anterior citava a rota `/lojista/conteudo-home`, mas a rota ativa no app hoje é `/admin/home-content`
- o frontend não depende exclusivamente da API: ele faz fallback para `localStorage`
- se o backend estiver fora do ar, a home continua usando os dados padrão ou os dados locais salvos no navegador
