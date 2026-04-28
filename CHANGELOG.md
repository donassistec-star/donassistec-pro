# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🐛 Corrigido

- **Salvar tabela de preços no admin**: `PUT /api/retailer-price-tables/admin/:slug` volta a funcionar em ambientes onde as migrations de versionamento ainda não criaram `version`, `changed_by` e `change_reason`
- **Histórico de preços**: comparação de snapshots no salvamento passa a usar o estado anterior correto da tabela antes do update

### 📚 Documentação

- **BACKEND_API.md**: observação sobre compatibilidade do `PUT /api/retailer-price-tables/admin/:slug` com bancos ainda sem migrations 35/36 aplicadas
- **docs/VERIFICAR-SERVIDOR.md** e **DEPLOY.md**: troubleshooting para `ERR_CONNECTION_REFUSED` quando o `nginx` estiver `inactive (dead)`, com sequência de validação e recuperação
- **DEPLOY.md**, **DATABASE_CONFIG.md**, **database/README.md** e **README_DEPLOY.md**: documentação do acesso atual ao phpMyAdmin via `127.0.0.1:8081` e da opção de proxy protegido com `nginx-phpmyadmin-secure.conf`

## [1.5.0] - 2026-03-27

### ✨ Adicionado

- **Módulo de tabelas de preços para lojistas**: admin em `/admin/tabela-precos` e área do lojista em `/lojista/tabela-precos`
- **Múltiplas tabelas por slug**: criação, edição, remoção e seleção de várias tabelas de preços
- **Importação e edição**: texto bruto, `.txt`, preview estruturado, edição manual de categorias/itens e exportação `.txt`
- **Curadoria de exibição**: visibilidade por tabela, destaque único para lojistas e ordenação manual
- **Experiência do lojista**: troca entre tabelas, busca por item, navegação por categorias, categorias recolhíveis e exportação PDF
- **Operação no admin**: duplicar tabela, filtros por status, busca, resumo por card e barra fixa de salvar

### 🔧 Melhorado

- **Fluxo de exclusão no admin**: confirmação para excluir tabela, categoria e item
- **Salvamento da edição**: CTA fixo de salvar durante a edição da tabela
- **Banco de dados**: suporte a `utf8mb4`, `featured_to_retailers` e `sort_order` na estrutura das tabelas de preços para lojistas

### 📚 Documentação

- **README.md**: novas funcionalidades do módulo de tabelas de preços para lojistas
- **BACKEND_API.md**: endpoints de `/api/retailer-price-tables/*`

## [1.4.0] - 2026-02-03

### ✨ Adicionado

- **Página de download do APK**: rota **/apk** (https://donassistec.com.br/apk) com título, botão "Baixar APK para Android", requisitos e links para Termos/Privacidade
- **Build Android (Capacitor)**: `capacitor.config.ts`, projeto `android/`, scripts `build:android`, `cap:open:android`, `android:apk`; documentação em `docs/APK.md`
- **Nginx fallback SPA**: em `nginx-vps.conf`, `proxy_intercept_errors on` e `error_page 404 = @spa`; location `@spa` devolve index.html quando o frontend retorna 404, para rotas como /apk funcionarem ao acessar direto

### 📚 Documentação

- **docs/APK.md**: como gerar o APK, publicar na página /apk (copiar para `public/DonAssistec.apk`), fallback SPA no nginx, troubleshooting
- **DEPLOY.md**: menção ao fallback SPA no nginx e à página /apk
- **README.md** e **FEATURES_LIST.md**: funcionalidade "Página de download do app Android (/apk)" e seção "App Android e página de download"

---

## [1.3.0] - 2026-01-25

### ✨ Adicionado

- **Pré-pedidos na área do lojista**: página `/lojista/pre-pedidos` com lista e detalhe; lojista vê apenas os seus (filtro por `retailer_id` = id ou email)
- **Detalhe do pré-pedido**: páginas `/admin/pre-pedidos/:id` e `/lojista/pre-pedidos/:id` com contato, itens, e ações de conversão
- **Conversão de pré-pedido em pedido**: botão "Converter em pedido" em Admin e Lojista; rota `POST /api/orders/from-pre-pedido` com validação de dono e bloqueio de reconversão
- **Indicador "Já convertido"**: na lista e no detalhe; link "Convertido em PED-0001" quando existir pedido originado; coluna "Convertido em" na exportação CSV de pré-pedidos
- **Link "Origem" no detalhe do pedido**: texto "Origem: PRE-0001" como link para o detalhe do pré-pedido (admin ou lojista)
- **API `GET /api/pre-pedidos/:id`**: detalhe de pré-pedido com `authenticateToken`; admin vê qualquer, lojista só os seus

### 🔧 Melhorado

- **Pedidos e pré-pedidos por lojista**: `OrderModel.findAll(retailerIds?)` e `PrePedidoModel.findAll(retailerIds?)` com `WHERE retailer_id IN (?,?)`; `OrderModel.findById` e `OrderController.getById` aceitam `retailerIds` para lojista
- **updateStatus e delete de pedidos**: `OrderController.updateStatus` e `delete` passam a usar `AuthRequest`; admin sem filtro, lojista restrito a `retailer_id IN (id, email)`. `OrderModel.updateStatus` e `delete` aceitam `retailerIds?: string[]`; frontend `ordersService.updateStatus(id, status)` e `delete(id)` sem parâmetro `retailerId`
- **Cart e Checkout**: `retailer_id` enviado como `user?.id || user?.email` (ou email do formulário no checkout) ao criar pré-pedido e pedido
- **Cache e atualização**: `Cache-Control: no-store, no-cache, must-revalidate` em `GET /api/orders` e `GET /api/pre-pedidos`; frontend com `?_=${Date.now()}` para evitar 304
- **Tratamento de erros**: toasts ao falhar carregamento de lista em Admin e Lojista para pedidos e pré-pedidos; `setList([])` no `catch`
- **Navegação**: título do card na lista de pré-pedidos como link para o detalhe; `PrePedidoModel` retorna `order_id` e `order_numero` via `LEFT JOIN` em `orders` (fallback se `pre_pedido_id` ausente)

### 📚 Documentação

- **API_ROUTES.md**: `GET /api/pre-pedidos`, `GET /api/pre-pedidos/:id`, `POST /api/orders/from-pre-pedido`, `GET /api/orders`; script `check-retailer-data.ts` para diagnóstico por lojista

---

## [1.2.0] - 2026-01-25

### ✨ Adicionado

- **Fluxo de fechamento do pré-orçamento**: ao finalizar, formulário com Nome, Empresa, Telefone, E-mail, Observações e “Marcar como urgente”; pré-preenchimento quando o lojista está logado
- **Migration 24** (`pre_pedidos`): campos `contact_name`, `contact_company`, `contact_phone`, `contact_email`, `notes`, `is_urgent`, `retailer_id`
- **Mensagem WhatsApp** no finalizar: bloco opcional “Meus dados / observações” (nome, empresa, observações, URGENTE) antes da lista de itens
- **Admin Pré-pedidos**: bloco “Dados de contato” ao expandir; badge “Urgente”; busca por nome, empresa e e-mail; exportação CSV com Contato, Empresa, Telefone, E-mail, Urgente, Observações

### 🔧 Melhorado

- **Cart**: diálogo de confirmação substituído por Dialog com formulário de contato (opcional) antes de enviar
- **API `POST /api/pre-pedidos`**: aceita `contact_name`, `contact_company`, `contact_phone`, `contact_email`, `notes`, `is_urgent`, `retailer_id`
- **Admin Pré-pedidos**: botão “Ver itens” renomeado para “Ver detalhes”

### 🐛 Corrigido

- **Vitest**: `vitest.config.ts` usa `@vitejs/plugin-react-swc` (já em devDependencies)
- **format.ts**: `formatCurrency` aceita `null`/`undefined` e normaliza espaço não-quebrável do `Intl`; `formatDate` retorna `"N/A"` para `null`/`undefined`
- **ESLint**: `ignores` com `backend/dist`; `no-explicit-any` e `no-require-imports` em `warn`; correções em `command.tsx`, `textarea.tsx`, `AdminDashboard.tsx`, `ModelsAdmin.tsx`, `RetailerReports.tsx` (no-empty, no-case-declarations, no-empty-object-type, prefer-const) — `npm run lint` passa

### 📚 Documentação

- **backend/README.md**: migração 24 e `npm run migrate:pre-pedidos-contact`; campos opcionais do POST pré-pedidos
- **API_ROUTES.md**: body de `POST /api/pre-pedidos` com os novos campos opcionais
- **DEPLOY.md**: como rodar migrations 23 e 24 após `git pull` ou em VPS com PM2
- **PRE_PUSH_CHECKLIST.md**: item Migrations; data 2026
- **INSTALLATION.md**: comentário sobre migrations incluindo 23 e 24
- **README.md**: pré-orçamento (lojistas) e pré-pedidos (admin) na lista de funcionalidades
- **PM2_SETUP.md**: subseção Migrations (rodar 23 e 24 antes do restart)
- **FEATURES_LIST.md**: seção Pré-orçamento e Pré-pedidos
- **NEXT_EVOLUTIONS.md**: pré-orçamento e pré-pedidos em Funcionalidades Implementadas
- **PROJECT_STATUS.md**: data 2026, versão 1.2.0, subseção Pré-orçamento e Pré-pedidos
- **PROJECT_SUMMARY.md**: versão 1.2.0, data 2026, pré-pedidos (admin) e pré-orçamento (lojistas)
- **ADMIN_GUIDE.md**: seção 5.1 Pré-pedidos; data 2026 e versão 1.2.0
- **.gitignore**: `backend/dist/` em Build outputs

---

## [1.1.0] - 2026-01-24

### ✨ Adicionado

- **Tabela de Valores**: página `/tabela-de-valores` com preços por modelo e serviço, filtro por marca e exportar Excel; rota `GET /api/price-table?brand=id` (pública)
- **GET /api/settings/public**: configurações públicas (contato, branding, redes) sem autenticação para Header, Footer e páginas públicas
- **nginx-vps.conf**: configuração Nginx para VPS (porta 80 → frontend :8200, `/api` e `/uploads` → backend :3001)
- **Link "Área do Administrador"** no Footer, visível apenas na home
- **Domínio donassistec.com.br**: detecção automática de API em `/api` e `/uploads` no mesmo host (frontend e backend); CORS atualizado

### 🔧 Melhorado

- **useSettings** passou a usar `/api/settings/public`; `getAll` permanece para o painel admin
- **Nginx (VPS)**: `proxy_set_header Host 127.0.0.1` no `location /` para evitar 403 do Vite/serve quando o acesso é por domínio
- **Vite**: `server.allowedHosts: true`; HMR configurável via `VITE_HMR_HOST` e `VITE_USE_POLLING` para acesso por IP ou em Docker/VM
- **Firewall**: documento de deploy com liberação de portas 80 e 443 (firewalld)
- Ocultar **Tabela de Valores** no Header e Footer quando o usuário está na home
- Remoção do `console.warn` de "Token não encontrado" no interceptor da API

### 📚 Documentação

- **README.md**: Tabela de Valores, `/api/settings/public`, `/api/price-table`, resumo de deploy com nginx-vps e firewall
- **API_ROUTES.md**: `GET /api/settings/public`, `GET /api/price-table`; base URL de produção
- **DEPLOY.md**: seção Nginx VPS com `nginx-vps.conf`, firewalld, CORS e rebuild do backend com PM2
- **PM2_SETUP.md**: rebuild e restart do backend após mudanças; CORS e Nginx; data
- **.env.example**: `VITE_HMR_HOST`, `VITE_USE_POLLING`, `VITE_API_URL` e domínio donassistec.com.br

---

## [1.0.0] - 2025-01-20

### ✨ Adicionado

#### Funcionalidades Principais
- Sistema completo de gerenciamento B2B
- Catálogo dinâmico de modelos e marcas
- Sistema de pedidos com múltiplos status
- Dashboard administrativo com métricas avançadas
- Área do lojista completa
- Sistema de tickets e suporte

#### Gerenciamento de Produtos
- CRUD completo de marcas
- CRUD completo de modelos
- Upload de imagens e vídeos
- Sistema de serviços dinâmicos por modelo
- Preços configuráveis por serviço
- Comparação de produtos
- Recomendações personalizadas

#### Sistema de Pedidos
- Criação e gerenciamento de pedidos
- Múltiplos status (Pendente, Processando, Concluído, Cancelado)
- Histórico completo de pedidos
- Exportação de pedidos (PDF, Excel, TXT)
- Notificações em tempo real

#### Configurações e Branding
- Módulo completo de configurações do sistema
- Gerenciamento de logo e favicon dinâmico
- Cores da marca configuráveis
- Informações da empresa (Razão Social, CNPJ, etc)
- Gerenciamento de contato e mídias sociais
- Busca automática de CEP
- Histórico de mudanças nas configurações

#### Analytics e Métricas
- Dashboard com métricas em tempo real
- Gráficos de vendas e pedidos
- Visualizações de produtos mais vistos
- Estatísticas de engajamento
- Exportação de relatórios

#### Integrações
- WhatsApp para contato
- Integração com Google Analytics
- Facebook Pixel
- Notificações em tempo real via Socket.IO

#### Segurança
- Autenticação JWT
- Role-based access control (RBAC)
- Logs de auditoria
- Proteção contra CORS
- Validação de dados

#### UI/UX
- Interface moderna e responsiva
- Componentes Shadcn UI
- Tema dark/light
- Animações suaves
- Acessibilidade melhorada

### 🔧 Melhorado

- Performance de queries do banco de dados
- Validação de formulários
- Tratamento de erros
- Feedback visual ao usuário
- Responsividade mobile

### 🐛 Corrigido

- Erro de CORS no upload de imagens
- Encoding duplo em URLs do WhatsApp
- Redirecionamento incorreto após logout
- Problemas de charset no banco de dados
- Validação de configurações

### 📚 Documentação

- README.md completo
- Guia de instalação detalhado
- Documentação da API
- Guia de configuração GitHub
- Guias de deployment

---

## Como Contribuir

Para adicionar novas funcionalidades ou correções, siga o padrão:

```markdown
### [Tipo] Descrição
- Item específico 1
- Item específico 2
```

Tipos:
- ✨ **Adicionado** - Novas funcionalidades
- 🔧 **Melhorado** - Melhorias em funcionalidades existentes
- 🐛 **Corrigido** - Correções de bugs
- 📚 **Documentação** - Mudanças na documentação
- 🔒 **Segurança** - Correções de segurança

---

[1.3.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.3.0
[1.2.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.2.0
[1.1.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.1.0
[1.0.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.0.0
