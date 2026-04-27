# Como Gerar Personal Access Token no GitHub

## 🔐 Passo a Passo para Criar Token

### Opção 1: Link Direto

1. **Acesse diretamente:**
   ```
   https://github.com/settings/tokens/new
   ```

2. **Preencha o formulário:**
   - **Note**: `DonAssistec Push` (ou qualquer nome que você preferir)
   - **Expiration**: Escolha uma data ou `No expiration`
   - **Select scopes**: Marque **`repo`** (isso dá acesso completo aos repositórios)

3. **Clique em "Generate token"** (botão verde no final da página)

4. **COPIE O TOKEN IMEDIATAMENTE** - você só verá ele uma vez!
   - Formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Opção 2: Via Menu do GitHub

1. Acesse https://github.com
2. Clique na sua foto de perfil (canto superior direito)
3. Clique em **Settings**
4. No menu lateral esquerdo, clique em **Developer settings**
5. Clique em **Personal access tokens**
6. Clique em **Tokens (classic)**
7. Clique em **Generate new token** → **Generate new token (classic)**
8. Preencha o formulário como descrito acima
9. Clique em **Generate token**
10. **COPIE O TOKEN**

## 📝 Configuração Recomendada

```
Note: DonAssistec Push
Expiration: 90 days (ou No expiration para desenvolvimento)
Scopes:
  ✅ repo (Full control of private repositories)
     - repo:status
     - repo_deployment
     - public_repo
     - repo:invite
     - security_events
```

## 🚀 Após Criar o Token

Execute:

```bash
cd /home/DonAssistec
git push origin main
```

Quando pedir credenciais:
- **Username**: `Ronei-rcm`
- **Password**: Cole o token que você copiou (começa com `ghp_`)

## ✅ Verificar Push Bem-Sucedido

Após o push:

```bash
# Verificar status
git status

# Ver branch remota
git branch -r

# Ver no GitHub
# Acesse: https://github.com/Ronei-rcm/donassistec
```

## 🔒 Segurança

- ⚠️ **Nunca compartilhe seu token**
- ⚠️ **Não commite tokens no código**
- ✅ Você pode revogar tokens a qualquer momento
- ✅ Use tokens diferentes para diferentes projetos
- ✅ Configure expiração apropriada

## 🔗 Links Úteis

- Criar token: https://github.com/settings/tokens/new
- Gerenciar tokens: https://github.com/settings/tokens
- Documentação: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

**Após criar o token, execute `git push origin main` no terminal.**
