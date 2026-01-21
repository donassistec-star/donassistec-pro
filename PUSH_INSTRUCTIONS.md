# Instruções para Push - Resolver Problema de Permissão

## 🔍 Problema Identificado

A chave SSH atual é uma **deploy key** que tem apenas permissão de **leitura**. Para fazer push, você precisa de uma chave SSH pessoal ou usar um Personal Access Token.

## ✅ Soluções

### Opção 1: Usar Personal Access Token (Mais Rápido)

1. **Criar Personal Access Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Nome: "DonAssistec Push"
   - Expiração: Escolha uma data
   - Permissões: Marque `repo` (todos os itens)
   - Clique em "Generate token"
   - **Copie o token** (você só verá ele uma vez!)

2. **Configurar Remote para HTTPS:**
   ```bash
   cd /home/DonAssistec
   git remote set-url origin https://github.com/Ronei-rcm/donassistec.git
   ```

3. **Fazer Push:**
   ```bash
   git push origin main
   # Quando pedir:
   # Username: Ronei-rcm
   # Password: cole seu Personal Access Token aqui
   ```

4. **Salvar Credenciais (Opcional):**
   ```bash
   git config --global credential.helper store
   # Na próxima vez não precisará digitar novamente
   ```

### Opção 2: Gerar Nova Chave SSH Pessoal

1. **Gerar Nova Chave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "seu_email@exemplo.com" -f ~/.ssh/id_donassistec
   # Quando pedir, pressione Enter para usar localização padrão
   # Pode deixar senha vazia ou criar uma
   ```

2. **Adicionar ao SSH Agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_donassistec
   ```

3. **Copiar Chave Pública:**
   ```bash
   cat ~/.ssh/id_donassistec.pub
   # Copie todo o conteúdo
   ```

4. **Adicionar Chave no GitHub:**
   - Acesse: https://github.com/settings/ssh/new
   - Title: "DonAssistec Server" ou qualquer nome
   - Key: Cole o conteúdo da chave pública
   - Clique em "Add SSH key"

5. **Configurar Git para Usar Nova Chave:**
   ```bash
   # Criar arquivo de configuração SSH
   cat >> ~/.ssh/config << EOF
   Host github.com-donassistec
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_donassistec
   EOF
   ```

6. **Atualizar Remote:**
   ```bash
   cd /home/DonAssistec
   git remote set-url origin git@github.com-donassistec:Ronei-rcm/donassistec.git
   ```

7. **Fazer Push:**
   ```bash
   git push origin main
   ```

### Opção 3: Usar Chave SSH Existente

Se você já tem uma chave SSH pessoal configurada:

1. **Verificar Chaves Disponíveis:**
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. **Testar Conexão:**
   ```bash
   ssh -T git@github.com
   ```

3. **Se funcionar, fazer push:**
   ```bash
   cd /home/DonAssistec
   git push origin main
   ```

## 🎯 Resumo Rápido

**Método Mais Simples (Recomendado):**

```bash
# 1. Criar Personal Access Token no GitHub (veja instruções acima)

# 2. Configurar HTTPS
cd /home/DonAssistec
git remote set-url origin https://github.com/Ronei-rcm/donassistec.git

# 3. Configurar credenciais
git config --global credential.helper store

# 4. Fazer push
git push origin main
# Username: Ronei-rcm
# Password: [cole seu Personal Access Token]
```

## ⚠️ Importante

- O commit já foi criado localmente ✅
- Todos os arquivos estão prontos ✅
- Só falta fazer o push para o GitHub ⏳

Após configurar a autenticação (método acima), o push funcionará!

---

**Status Atual**: Commit local criado, aguardando push para GitHub.
