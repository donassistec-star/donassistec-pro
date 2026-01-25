# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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

[1.1.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.1.0
[1.0.0]: https://github.com/seu-usuario/donassistec/releases/tag/v1.0.0
