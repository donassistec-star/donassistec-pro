# Erros comuns no curl de login

## 1. Quebra de linha no JSON (comando quebrado)

**Erro:** Ao colar ou digitar o `-d`, o JSON ficou partido em duas linhas:

```bash
# ERRADO – quebra no meio do JSON gera JSON inválido
curl -s -X POST "http://donassistec.com.br/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ronei@donassistec.com","
password":"admin123"}'
```

Isso produz JSON inválido. A API pode retornar 400 ou a resposta fica inconsistente.

**Correto:** Deixar o `-d` em **uma única linha**:

```bash
curl -s -X POST "http://donassistec.com.br/api/auth/login" -H "Content-Type: application/json" -d '{"email":"ronei@donassistec.com","password":"admin123"}'
```

Ou quebrando apenas **depois** do JSON (não no meio):

```bash
curl -s -X POST "http://donassistec.com.br/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ronei@donassistec.com","password":"admin123"}'
```

---

## 2. admin_team x retailers – qual login acessa /admin?

| Tabela      | Script que cria              | Acessa /admin (painel)? |
|------------|------------------------------|---------------------------|
| **admin_team** | create-admin-team, reset-and-create-admin, bootstrap | **Sim** (`source: "admin_team"`) |
| **retailers**  | create-admin-user, registro de lojista | **Não** (`source: "retailer"`) |

- **admin@donassistec.com** criado por `create-admin-user.js` está em **retailers**. O login devolve `company_name`, `phone`, `cnpj` e `source: "retailer"`. Esse usuário **não** acessa `/admin/login` (área da equipe).
- Para o **painel admin** é necessário usuário em **admin_team**. Ex.: `create-admin-team.js` (padrão: ronei@donassistec.com) ou `reset-and-create-admin.js` (padrão: admin@donassistec.com).

---

## 3. ronei@donassistec.com não existe ou senha errada

Se o JSON estiver correto e ainda assim der **401 "Email ou senha inválidos"**, o usuário não está em `admin_team` nem em `retailers` com essa senha (ou está inativo).

**Criar ou resetar ronei na admin_team** (no servidor, pasta `backend`):

```bash
# Criar (se não existir)
email=ronei@donassistec.com senha=admin123 nome=Ronei node scripts/create-admin-team.js

# Resetar senha (se já existir)
email=ronei@donassistec.com senha=admin123 nome=Ronei reset=1 node scripts/create-admin-team.js
```

Depois, testar com o JSON em **uma linha**:

```bash
curl -s -X POST "http://donassistec.com.br/api/auth/login" -H "Content-Type: application/json" -d '{"email":"ronei@donassistec.com","password":"admin123"}'
```
