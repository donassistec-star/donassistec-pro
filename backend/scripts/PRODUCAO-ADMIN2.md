# Resolver 401 "Email ou senha inválidos" – admin2 em PRODUÇÃO

O 401 em **https://donassistec.com.br/admin/login** com `admin2@donassistec.com` ocorre porque a API de **produção** usa o banco de **produção**. O usuário precisa existir na tabela `admin_team` desse banco.

---

## Resumo rápido (se a migration 29 já estiver aplicada)

No servidor, na pasta **backend** (com o `.env` de produção):

```bash
# 1) Ver quem já está na equipe
node scripts/list-admin-team.js

# 2) Criar ou redefinir admin2 (troque admin123 por uma senha forte)
email=admin2@donassistec.com senha=admin123 nome=Admin2 reset=1 node scripts/create-admin-team.js
```

Depois: login em https://donassistec.com.br/admin/login com esse e-mail e senha.

---

## Passo 1: Diagnóstico

No **servidor onde a API de donassistec.com.br roda**, na pasta do backend:

```bash
cd /caminho/do/projeto/backend
node scripts/list-admin-team.js
```

- **"Tabela admin_team não existe"** → aplique a migration 29 e depois volte ao Passo 1:
  ```bash
  npm run migrate:admin-team
  ```
  (equivale a `npx tsx scripts/run-migration-29.ts`; rode de dentro da pasta `backend` com o mesmo `.env` da API.)
- **Lista vazia** → crie o admin2 com o Passo 2.
- **`admin2@donassistec.com` aparece como inativo** → use `reset=1` no Passo 2 (o script reativa e redefine a senha).
- **`admin2@donassistec.com` está ativo** → use `reset=1` para redefinir a senha (pode ter sido digitada errada ou nunca definida em produção).

---

## Passo 2: Criar ou corrigir admin2

Ainda na pasta `backend`, com o **mesmo `.env` que a API de produção usa** (mesmo `DB_*`):

### Criar pela primeira vez

```bash
email=admin2@donassistec.com senha=admin123 nome=Admin2 node scripts/create-admin-team.js
```

### Já existe e você quer (re)definir a senha e reativar

```bash
email=admin2@donassistec.com senha=admin123 nome=Admin2 reset=1 node scripts/create-admin-team.js
```

Use uma senha forte em produção; `admin123` é só exemplo.

---

## Passo 3: Testar o login

1. Acesse **https://donassistec.com.br/admin/login**
2. E-mail: **admin2@donassistec.com**
3. Senha: a que você passou em `senha=` (ex.: `admin123`)

---

## Se ainda der 401

1. **Migration 29**  
   - A tabela `admin_team` existe no banco de produção?  
   - Se não: `npm run migrate:admin-team` (na pasta `backend`).

2. **Mesmo banco**  
   - O script usa o `.env` de `backend/`.  
   - A API de produção usa **o mesmo** `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`?  
   - Se a API rodar em **Docker**, o script deve rodar onde consiga conectar no **mesmo** MySQL (host, porta, usuário, senha, base). Ex.: no host com `.env` que aponta para o MySQL (localhost ou IP do container), ou dentro de um container com as mesmas variáveis.

3. **Conferir de novo**  
   - Rode de novo:  
     `node scripts/list-admin-team.js`  
   - Confirme que `admin2@donassistec.com` aparece e está **ativo**.

4. **Senha**  
   - Tente de novo com `reset=1` e uma senha simples (ex.: `admin123`) para descartar erro de digitação.

---

## Ver usuários da equipe

```bash
cd /caminho/do/projeto/backend
node scripts/list-admin-team.js
```

Mostra e-mail, nome, role e se está ativo. Use um desses e-mails e a senha definida no `create-admin-team` (ou no `reset-admin-team-password`).
