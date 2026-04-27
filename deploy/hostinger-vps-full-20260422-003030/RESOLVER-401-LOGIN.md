# Resolver 401 "Email ou senha inválidos" no /admin/login

O **401** em **https://donassistec.com.br/admin/login** significa que a **API de produção** não encontrou um usuário válido na tabela **admin_team** do **banco de produção** (e-mail + senha corretos, usuário ativo).

---

## Opção A: Criar pelo navegador (quando a tabela existe e está vazia)

Se a tabela **admin_team** existir mas estiver **vazia**, na tela de **/admin/login** aparece o botão **"Criar primeiro administrador"**. Clique, preencha nome, e-mail e senha, e o primeiro admin é criado — sem precisar de SSH.

**Se o botão não aparecer:** a tabela pode não existir ou já pode haver usuários. Use a Opção B.

---

## Opção B: No servidor (SSH)

Tudo deve ser executado **no servidor onde a API de donassistec.com.br roda**, na pasta do **backend**, com o **mesmo `.env`** que a API usa (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).

---

## Passo 1: Diagnosticar

```bash
cd /caminho/do/projeto/backend
node scripts/diagnostic-admin-login.js
```

O script mostra:

- se consegue conectar no MySQL
- se a tabela `admin_team` existe
- quantos usuários há e se estão ativos
- o comando sugerido para corrigir

---

## Passo 2: Corrigir

### Se a tabela `admin_team` não existir

```bash
npm run migrate:admin-team
```

Depois rode de novo o `diagnostic-admin-login.js`.

### Se não houver usuários (ou quiser recomeçar do zero)

```bash
node scripts/reset-and-create-admin.js
```

Isso **apaga** todos os usuários da `admin_team` e **cria um**:

- **E-mail:** admin@donassistec.com  
- **Senha:** admin123  

Para definir outro e-mail/senha:

```bash
email=admin@donassistec.com senha=SuaSenhaForte123 nome=Admin node scripts/reset-and-create-admin.js
```

### Se o usuário existir mas a senha estiver errada

Use o `create-admin-team` com `reset=1` (redefine a senha; se o e-mail não existir, cria):

```bash
email=admin@donassistec.com senha=NovaSenha123 nome=Admin reset=1 node scripts/create-admin-team.js
```

---

## Passo 3: Testar o login

1. Acesse **https://donassistec.com.br/admin/login**
2. Use o **e-mail** e a **senha** que o script exibiu (ou que você passou em `email=` e `senha=`)

---

## Se a API rodar em Docker

Os scripts precisam usar o **mesmo MySQL** que o container da API. Opções:

- Rodar os scripts **no host**, com um `.env` cujo `DB_HOST`/`DB_PORT` aponte para o MySQL (ex.: `localhost` ou IP do container de banco).
- Ou rodar **dentro do container da API** (se tiver Node e os `node_modules`/scripts):

  ```bash
  docker exec -it NOME_DO_CONTAINER_DA_API sh
  cd /app  # ou onde está o backend
  node scripts/diagnostic-admin-login.js
  node scripts/reset-and-create-admin.js
  ```

---

## Resumo dos comandos

| Comando | O que faz |
|---------|-----------|
| `node scripts/diagnostic-admin-login.js` | Mostra se a tabela e usuários existem e o que fazer |
| `npm run migrate:admin-team` | Cria a tabela `admin_team` (se não existir) |
| `node scripts/reset-and-create-admin.js` | Apaga todos e cria 1 admin (admin@donassistec.com / admin123) |
| `email=X senha=Y nome=Z node scripts/reset-and-create-admin.js` | Mesmo que acima, com e-mail, senha e nome definidos |
| `email=X senha=Y reset=1 node scripts/create-admin-team.js` | Cria ou atualiza a senha do usuário com e-mail X |
| `node scripts/list-admin-team.js` | Lista os e-mails da `admin_team` |
