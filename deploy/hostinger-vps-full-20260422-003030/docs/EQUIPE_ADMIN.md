# Gestão de Equipe no Painel Admin

O painel admin permite adicionar usuários da equipe com funções **admin**, **gerente**, **técnico** e **user**, e controlar quais módulos cada um vê no menu.

## O que está implementado

- **Página Equipe** (`/admin/equipe`): listagem, criar, editar, definir senha, ativar/desativar, remover
- **Módulos por usuário**: na ação "Módulos" de cada usuário, é possível marcar/desmarcar cada módulo do painel (ocultar ou exibir em relação ao padrão da função)
- **Menu**: o item "Equipe" só aparece para quem tem **source = admin_team** e **role = admin**

## Como ativar

### 1. Aplicar a migration 29

Cria as tabelas `admin_team`, `admin_role_modules` e `admin_user_module_overrides`:

```bash
cd backend
npm run migrate:admin-team
```

Ou executar manualmente o SQL em `backend/database/migrations/29_admin_team.sql`.

### 2. Criar o primeiro usuário da equipe

A tabela `admin_team` começa vazia. Crie o primeiro admin:

```bash
cd backend
node scripts/create-admin-team.js
```

Padrão do script: `ronei@donassistec.com` / `admin123` / Nome: Administrador.

Com e-mail e senha próprios:

```bash
email="seu@email.com" senha="suaSenha" nome="Seu Nome" node scripts/create-admin-team.js
```

### 3. Login

Acesse **/admin/login** com o e-mail e a senha do usuário criado. O menu **Equipe** aparecerá para esse admin. A partir daí, use a tela Equipe para adicionar os demais usuários (gerente, técnico, user) e configurar os módulos de cada um.

## Funções e módulos (padrão)

| Função   | Módulos (padrão) |
|----------|-------------------|
| **admin**  | Todos (incluindo Equipe) |
| **gerente** | Todos exceto Equipe |
| **user**   | Dashboard, Pedidos, Pré-pedidos, Tickets, Lojistas, Relatórios, Avaliações |
| **técnico** | Dashboard, Modelos, Marcas, Serviços, Pedidos, Pré-pedidos, Estoque |

Na tela **Módulos** de cada usuário você pode ocultar ou exibir módulos em relação a esse padrão.

---

## Resolver 401 "Email ou senha inválidos"

Se ao fazer login em /admin/login você recebe **401 Email ou senha inválidos**:

1. **Confirme qual e-mail existe na admin_team** (no servidor):
   ```bash
   cd backend && node scripts/list-admin-team.js
   ```

2. **Crie um usuário** (se a lista estiver vazia):
   ```bash
   cd backend && node scripts/create-admin-team.js
   ```
   Use o e-mail e a senha que o script imprimir.

3. **Redefina a senha** (se o usuário já existe e você não sabe a senha):
   ```bash
   cd backend && email=ronei@donassistec.com senha=novasenha123 node scripts/reset-admin-team-password.js
   ```
   Depois faça login com esse e-mail e `novasenha123`.
