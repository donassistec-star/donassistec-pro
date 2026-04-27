# Análise do Módulo Catálogo — DonAssistec

**Data:** Janeiro 2025  
**Escopo:** Frontend (React), Backend (Node/Express), API, dados e fluxos.

---

## 1. Visão geral

O **módulo Catálogo** lista modelos de celulares (phone_models), marcas (brands), serviços por modelo e disponibilidade. Oferece:

- Listagem com filtros, busca, ordenação e paginação
- Integração com API e fallback para dados estáticos
- Sincronização de filtros com a URL
- Comparação de até 3 modelos
- Vídeos em destaque, sugestões de busca e cards com ações (carrinho, favoritos, orçamento)

---

## 2. Arquitetura

### 2.1 Frontend

| Camada | Arquivos | Função |
|--------|----------|--------|
| **Página** | `src/pages/Catalog.tsx` | Orquestração: estado, URL, filtros, busca, ordenação, paginação, grid, comparação |
| **Componentes** | `src/components/catalog/CatalogFilters.tsx` | Filtros (marcas, serviços, disponibilidade, Premium, Popular) em Accordion + tags ativas |
| | `src/components/catalog/MobileFiltersSheet.tsx` | Sheet lateral com `CatalogFilters` para mobile |
| | `src/components/catalog/ModelCard.tsx` | Card: imagem, badges, disponibilidade, favorito, vídeo, serviços, ações (Orçamento, Adicionar, Detalhes) |
| | `src/components/catalog/SearchSuggestions.tsx` | Dropdown de sugestões (modelos populares ou resultado da busca) |
| **Hooks** | `src/hooks/useModels.ts` | `useModels(filters)`, `useModel(id)` — chama `modelsService` |
| | `src/hooks/useBrands.ts` | `useBrands()` — chama `brandsService` |
| **Serviços** | `src/services/modelsService.ts` | `modelsService.getAll(filters)`, `getById`, `getByBrand`; `brandsService.getAll`, etc. Conversão API → `PhoneModel` / `Brand`. |
| **API HTTP** | `src/services/api.ts` | Axios: `baseURL` via `VITE_API_URL` ou `hostname:3001/api`, interceptors (token, erros) |
| **Dados estáticos** | `src/data/models.ts` | `PhoneModel`, `Brand`, `phoneModels`, `brands`, `serviceTypes`, `availabilityOptions` |

Outros usados pelo catálogo: `ComparisonModal`, `VideoThumbnail`, `VideoPlayer`, `Breadcrumbs`, `LoadingSkeleton`, `Header`, `Footer`, `WhatsAppFloat`.

### 2.2 Backend

| Camada | Arquivos | Função |
|--------|----------|--------|
| **Rotas** | `backend/src/routes/models.ts` | `GET /`, `GET /:id`, `GET /brand/:brandId`, `GET /:id/videos`; POST/PUT/DELETE com auth admin |
| | `backend/src/routes/brands.ts` | `GET /`, `GET /:id`; POST/PUT/DELETE com auth admin |
| **Controller** | `backend/src/controllers/PhoneModelController.ts` | `getAll` com `search`, `brand`, `availability`, `premium`, `popular`, `service`; combina busca + filtros; `getById`, `getByBrand`, CRUD, vídeos |
| | `backend/src/controllers/BrandController.ts` | `getAll`, `getById`, CRUD |
| **Model** | `backend/src/models/PhoneModelModel.ts` | `findAll`, `findById`, `findByBrand`, `search`, `filter`, `getServices`, `getVideos`, `mapRowsToModels`, CRUD e vídeos |
| | `backend/src/models/BrandModel.ts` | CRUD de marcas |

Montagem no `index`:  
`/api/models` → `modelsRoutes`, `/api/brands` → `brandsRoutes`.

---

## 3. Fluxo de dados

### 3.1 Listagem com filtros

1. **Catalog** lê `useSearchParams`, inicializa estado (brand, service, availability, search, premium, popular, sort) a partir da URL.
2. **useModels(filters)** chama `modelsService.getAll(filters)` → `GET /api/models?brand=...&service=...&search=...&premium=...&popular=...`
3. **useBrands()** chama `brandsService.getAll()` → `GET /api/brands`
4. **PhoneModelController.getAll**:
   - Se há `search`: `PhoneModelModel.search(search)` e, em seguida, aplica em memória: `brands`, `availability`, `premium`, `popular`, `services`
   - Senão: `PhoneModelModel.filter(filters)`
   - Sem filtros: `PhoneModelModel.findAll()`
5. Resposta em `{ success, data }`; `modelsService` converte `ApiPhoneModel` → `PhoneModel` (brand_id→brand, image_url→image, services snake_case→camelCase, videos).
6. **Catalog** define `useApi = !modelsError && apiModels.length > 0`; se `useApi`, usa `apiModels` e `apiBrands`, senão `phoneModels` e `staticBrands`.
7. **filteredModels** (useMemo):
   - Se API + algum filtro: filtra `apiModels` por premium/popular se ativos, depois ordena (name, brand, stock_first, popular).
   - Senão: filtra `models` localmente (premium, popular, search avançada, brand, service, availability) e ordena.
8. **paginatedModels** = `filteredModels.slice(0, page * 24)`; `hasMore` =是否存在 mais itens.
9. Render: `ModelCard` por item em `paginatedModels`, `CatalogFilters` (sidebar), `MobileFiltersSheet`, barra de busca + `SearchSuggestions`, sort, view mode (grid/list), comparação, “Carregar mais”.

### 3.2 Busca

- **Input**: `searchInput` (valor imediato); debounce 400 ms → `searchQuery`.
- **searchQuery** vai para `useModels({ search: searchQuery, ... })` e para o `useMemo` de `filteredModels` (no branch estático).
- **SearchSuggestions** recebe `searchQuery` (= `searchInput` no Catalog).  
  - Vazio: mostra “Modelos populares” (até 5) e “Buscas populares” (fixas).  
  - Preenchido: `useModels({})` e filtro local por nome, brand e nome da marca; até 8; ao clicar, navega para `/modelo/:id` e limpa busca.

### 3.3 URL

- **Leitura**: em `useState` inicial, `sp.getAll("brand")`, `sp.get("search")`, `sp.get("premium")=== "1"`, etc.
- **Escrita**: `useEffect` com `[selectedBrands, selectedServices, selectedAvailability, searchQuery, selectedPremium, selectedPopular, sortBy, setSp]` monta `URLSearchParams` e `setSp(params, { replace: true })`.
- Ex.: `?brand=apple&service=reconstruction&search=iphone&premium=1&popular=1&sort=stock_first`

---

## 4. Modelo de dados

### 4.1 PhoneModel (frontend)

```ts
id, brand, name, image, videoUrl?, videos?: { id, title, url, thumbnail?, duration }[],
services: { reconstruction, glassReplacement, partsAvailable },
availability: "in_stock"|"order"|"out_of_stock", premium, popular
```

Opcional (API dinâmica): `modelServices` com `service_id`, `available`, `service: { name, description }`.

### 4.2 Brand (frontend)

```ts
id, name, icon?, logo?, color?
```

### 4.3 Backend (PhoneModelModel.mapRowsToModels)

- Row → `id`, `brand_id`, `name`, `image_url`, `video_url`, `availability`, `premium`, `popular`, `brand: { id, name, logo_url, icon_name }`
- `getServices(model.id)` → `model.services` (reconstruction, glass_replacement, parts_available)
- `getVideos(model.id)` → `model.videos`

`modelsService.convertApiModelToFrontend` faz: `brand_id`→`brand`, `image_url`→`image`, `video_url`→`videoUrl`, `services` snake_case→camelCase, `videos` com `id` string.

---

## 5. Filtros e ordenação

### 5.1 Filtros (CatalogFilters)

| Filtro | Valores | Origem | Onde aplica |
|--------|---------|--------|-------------|
| Marcas | ids (multi) | `brands` (API ou estático) | `useModels({ brand })` ou filtro local `selectedBrands.includes(model.brand)` |
| Serviços | reconstruction, glassReplacement, partsAvailable | `serviceTypes` em `@/data/models` | `useModels({ service })` ou `model.services[chave]` |
| Disponibilidade | in_stock, order, out_of_stock | `availabilityOptions` | `useModels({ availability })` ou `selectedAvailability.includes(model.availability)` |
| Premium | boolean | estado | `useModels({ premium })` ou `model.premium` |
| Popular | boolean | estado | `useModels({ popular })` ou `model.popular` |

Tags ativas: cada filtro aplicado vira um `Badge` clicável que remove esse filtro.

### 5.2 Ordenação (Catalog)

- **popular**: popular → premium → nome.
- **name**: `name` A–Z.
- **brand**: `brand` A–Z.
- **stock_first**: `in_stock` < `order` < `out_of_stock`; depois popular e nome.

Sempre aplicada no front (em `filteredModels`) sobre o resultado já vindo da API ou estático.

---

## 6. Paginação e performance

- **PAGE_SIZE**: 24.
- **paginatedModels**: `filteredModels.slice(0, page * PAGE_SIZE)`.
- Botão “Carregar mais” chama `setPage(p => p + 1)`; página é resetada quando mudam filtros, search, premium, popular ou sort.
- Imagens no `ModelCard`: `loading="lazy"`.
- **useModels** depende de `JSON.stringify(filters)`; qualquer mudança de filtros refaz a requisição. Busca com debounce 400 ms reduz requisições ao digitar.

---

## 7. Fallback (API indisponível)

- `useApi = !modelsError && apiModels.length > 0`: se houver erro ou zero modelos da API, usa `phoneModels` e `staticBrands`.
- Em modo estático, todos os filtros e a busca avançada (nome, marca, termos de serviço, estoque, premium, popular) são aplicados no `useMemo` de `filteredModels`.

---

## 8. Integrações

- **Carrinho**: `ModelCard` usa `useCart().addItem, getItemCount`; `addItem(model, model.services)`.
- **Favoritos**: `useFavorites().toggleFavorite, isFavorite`; ícone de coração e toast.
- **WhatsApp**: `handleContact` monta mensagem e `window.open(wa.me/...)`; número pode vir de settings (no `Catalog` está fixo `5511999999999` — provável ponto de melhoria).
- **Comparação**: até 3 modelos; `ComparisonModal` recebe `filteredModels` filtrados por `comparisonModels`.
- **Vídeos**: `VideoThumbnail` na seção “Vídeos Tutoriais”; `VideoPlayer` no hover do card; `model.videoUrl` ou `model.videos[0].url`.
- **BrandsSection (Home)**: `Link to={/catalogo?brand=${brand.id}}` — ao abrir o catálogo, o estado já é preenchido pela URL.

---

## 9. Pontos de atenção e melhorias

### 9.1 Já tratados

- Filtros na URL, debounce na busca, ordenação “Em estoque primeiro”, paginação “Carregar mais”, Premium/Popular, combinação de `search` + demais filtros no backend, `ModelCard` com `brands` opcional e `loading="lazy"`.

### 9.2 Ajustes sugeridos

1. **WhatsApp em `handleContact`**  
   - Número fixo `5511999999999`; o ideal é usar `settings?.contactPhoneRaw` ou equivalente, como no Header.

2. **SearchSuggestions**
   - `useModels({})` sem filtros: sempre busca todos os modelos; em catálogos grandes, um endpoint de sugestões (`/api/models/suggest?q=`) ou limite (ex.: `?limit=50`) reduz custo.
   - Badges “Buscas populares” não têm `onClick` que preencha o campo de busca; hoje não disparam busca.

3. **viewMode "list"**
   - `viewMode` existe e altera o grid (`grid-cols-1` em list), mas `ModelCard` não tem variante “lista”; layout continua em cards. Considerar uma `ModelCardList` ou prop `variant="list"`.

4. **useModels e refetch**
   - `refetch` em `useModels` repete a mesma lógica de `fetchModels`; poderia chamar uma função interna reutilizada.
   - Dependência `JSON.stringify(filters)` funciona, mas gera nova string a cada render; `useMemo` nos filtros enviados ou comparação estável pode reduzir refetch desnecessários.

5. **Conversão API e modelServices**
   - `convertApiModelToFrontend` não mapeia `modelServices` (serviços dinâmicos). O `ModelCard` usa `(model as any).modelServices` quando existem; a API precisa retornar `model_services`/`modelServices` para esse caso. Verificar se o backend já inclui e, se sim, tipar e mapear no `modelsService`.

6. **Telefone no Contact**
   - Conferir se em todos os pontos de “Orçamento”/contato se usa o mesmo valor (settings ou constante) para WhatsApp.

7. **Erro de API e empty**
   - Se `modelsError` e `apiModels.length === 0`, o fallback cai em estático. Se não houver dados estáticos para aqueles filtros, a UX é ok (empty state). Se `modelsError` existir mas `apiModels` tiver dados de uma requisição anterior, `useApi` pode continuar true; o critério atual evita isso ao exigir `apiModels.length > 0`.

8. **Contagem por marca no filtro**
   - CatalogFilters não mostra “(N)” ao lado de cada marca; poderia ajudar a escolha. Ex.: `Apple (12)` — exigiria passar `models` ou um mapa `brandId → count` para o `CatalogFilters`.

---

## 10. Endpoints da API (resumo)

| Método | Rota | Uso no catálogo |
|--------|------|------------------|
| GET | `/api/models?brand&service&availability&search&premium&popular` | Listagem com filtros e busca |
| GET | `/api/models/:id` | ModelDetail (fora do Catalog, mas mesmo recurso) |
| GET | `/api/models/brand/:brandId` | `modelsService.getByBrand` (ex.: futuro link “Ver todos da marca”) |
| GET | `/api/brands` | Lista de marcas para filtros, cards e sugestões |

---

## 11. Dependências de terceiros

- **Frontend**: React, react-router-dom (Router, Link, useNavigate, useSearchParams), lucide-react, axios, sonner (toast), @/components/ui (shadcn).
- **Backend**: express, mysql2; modelos e controllers próprios.

---

## 12. Checklist de manutenção

- [x] Trocar número fixo de WhatsApp em `handleContact` por configuração (settings).
- [x] Definir `onClick` das “Buscas populares” em `SearchSuggestions` (prop `onPopularSearchClick`).
- [ ] Avaliar endpoint de sugestões ou `limit` para `SearchSuggestions` em cenários com muitos modelos.
- [x] Implementar layout “lista” para `viewMode === "list"` (ModelCard `variant="list"`).
- [ ] Garantir que a API inclua e que o `modelsService` converta `modelServices` quando existir; remover `(model as any)` no `ModelCard`.
- [ ] (Opcional) Contagem por marca nos filtros e/ou cache/refetch otimizado em `useModels`.

---

## 13. Revisão (jan 2025) — Catálogo e PM2

### Catálogo
- **SearchSuggestions**: prop `onPopularSearchClick?: (term: string) => void`; ao clicar em "Buscas populares" aplica o termo na busca. `useEffect` com deps `[searchQuery, phoneModels]`.
- **Catalog**: passa `onPopularSearchClick` para `SearchSuggestions`.

### PM2 e produção
- **Script** `start:prod`: `serve -s dist -l 8200` (pacote `serve`). Serve o build na porta 8200.
- **ecosystem.production.config.cjs**: frontend com `args: "run start:prod"`. Uso: `npm run build` e `pm2 start ecosystem.production.config.cjs`. Ajustar `CORS_ORIGIN` no backend conforme a URL do frontend.

---

*Documento gerado a partir do código em `src/pages/Catalog.tsx`, `src/components/catalog/*`, `src/hooks/useModels.ts`, `src/hooks/useBrands.ts`, `src/services/modelsService.ts`, `src/data/models.ts`, `backend/src/controllers/PhoneModelController.ts`, `backend/src/models/PhoneModelModel.ts` e rotas relacionados.*
