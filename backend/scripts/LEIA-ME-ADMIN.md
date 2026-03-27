# Acesso ao painel Admin — do zero

O painel **/admin** só aceita usuários da tabela **admin_team**. Lojistas (retailers) não entram.

**Se estiver tomando 401 "Email ou senha inválidos" em produção:** veja **`RESOLVER-401-LOGIN.md`** na raiz do projeto. Rode primeiro `node scripts/diagnostic-admin-login.js` no servidor.

---

## 1. Diagnosticar (recomendado)

```bash
cd backend
node scripts/diagnostic-admin-login.js
```

Mostra se a tabela e usuários existem e sugere o comando para corrigir.

---

## 2. Tabela existe?

Se ao rodar os scripts der **"Tabela admin_team não existe"**:

```bash
cd backend
npm run migrate:admin-team
```

---

## 3. Limpar tudo e criar UM admin

Na pasta **backend** (com o `.env` do servidor):

```bash
node scripts/reset-and-create-admin.js
```

Isso **apaga** todos os usuários da `admin_team` e **cria um**:

- **E-mail:** admin@donassistec.com  
- **Senha:** admin123  

Para usar outro e-mail/senha:

```bash
email=seu@email.com senha=SuaSenha123 nome=SeuNome node scripts/reset-and-create-admin.js
```

---

## 4. Login

1. Acesse **/admin/login**
2. E-mail e senha que o script mostrou (ou que você passou em `email=` e `senha=`)

---

## Resumo

| Comando | O que faz |
|--------|-----------|
| `node scripts/diagnostic-admin-login.js` | Diagnóstico: tabela, usuários e comando para corrigir 401 |
| `npm run migrate:admin-team` | Cria a tabela `admin_team` (só se não existir) |
| `node scripts/reset-and-create-admin.js` | Apaga todos os admins e cria um novo |
| `node scripts/list-admin-team.js` | Lista e-mails da admin_team |
