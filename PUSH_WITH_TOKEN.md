# Push para GitHub usando Personal Access Token

## 🚀 Método Rápido - HTTPS com Token

### 1. Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Preencha:
   - **Note**: "DonAssistec Push"
   - **Expiration**: Escolha uma data (ou "No expiration")
   - **Select scopes**: Marque **`repo`** (isso dá acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **IMPORTANTE**: Copie o token imediatamente (você só verá ele uma vez!)

### 2. Fazer Push

Execute os seguintes comandos:

```bash
cd /home/DonAssistec

# Verificar remote está como HTTPS
git remote -v

# Se não estiver, configurar:
# git remote set-url origin https://github.com/Ronei-rcm/donassistec.git

# Configurar para salvar credenciais (opcional)
git config --global credential.helper store

# Fazer push
git push origin main
```

### 3. Quando Pedir Credenciais

Quando o Git pedir credenciais:

- **Username**: `Ronei-rcm`
- **Password**: Cole o **Personal Access Token** que você copiou

**IMPORTANTE**: Use o token como senha, não sua senha do GitHub!

### 4. Verificar Push

Após o push bem-sucedido:

```bash
# Verificar status
git status

# Verificar branch remota
git branch -r

# Ver no GitHub
# Acesse: https://github.com/Ronei-rcm/donassistec
```

## ✅ Status Atual

- ✅ Commit criado localmente (228 arquivos)
- ✅ Remote configurado para HTTPS
- ⏳ Aguardando push com token

## 🔐 Segurança

- O Personal Access Token é mais seguro que senha
- Você pode revogar o token a qualquer momento
- Use tokens diferentes para diferentes projetos

---

**Pronto para push!** Depois de criar o token, execute `git push origin main`.
