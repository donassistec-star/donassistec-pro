# Checklist Pré-Push - DonAssistec

Use este checklist antes de fazer push para o GitHub.

## ✅ Verificações Essenciais

### 🔒 Segurança

- [ ] Verificar que `.env` NÃO está no staging
  ```bash
  git status | grep .env
  # Não deve aparecer nenhum arquivo .env
  ```

- [ ] Verificar que `.env.example` existe e está configurado
  ```bash
  ls -la .env.example backend/.env.example
  ```

- [ ] Verificar que não há senhas hardcoded
  ```bash
  grep -r "password.*=" src/ backend/src/ --exclude-dir=node_modules | grep -v "//" | grep -v example
  # Não deve mostrar senhas reais
  ```

### 📁 Arquivos Grandes

- [ ] Verificar arquivos grandes (>5MB)
  ```bash
  find . -type f -size +5M | grep -v node_modules | grep -v .git
  # Deve estar vazio ou apenas arquivos aceitáveis
  ```

### 🏗️ Build

- [ ] Backend compila sem erros
  ```bash
  cd backend && npm run build
  ```

- [ ] Frontend compila sem erros
  ```bash
  npm run build
  ```

### 📝 Documentação

- [ ] README.md atualizado
- [ ] INSTALLATION.md criado
- [ ] GITHUB_SETUP.md criado
- [ ] CONTRIBUTING.md criado
- [ ] CHANGELOG.md criado
- [ ] API_ROUTES.md criado (opcional mas recomendado)

### 🗂️ Estrutura

- [ ] `.gitignore` configurado corretamente
- [ ] `backend/uploads/.gitkeep` existe
- [ ] Sem arquivos de cache ou temporários

### 🗄️ Migrations (se alterou o banco)

- [ ] Novas migrations documentadas em `backend/README.md`
- [ ] Em deploy/atualização: rodar `npm run migrate:pre-pedidos` e `migrate:pre-pedidos-contact` se aplicável (ver `DEPLOY.md`)

## 📊 Status do Projeto

**Arquivos Modificados**: ~90  
**Arquivos Novos**: ~68  
**Status**: ✅ Pronto para push

## 🚀 Próximos Passos

Após verificar todos os itens:

1. **Revisar mudanças:**
   ```bash
   git status
   git diff --cached  # Se já adicionou algo
   ```

2. **Fazer commit:**
   ```bash
   # Ver instruções detalhadas em PUSH_TO_GITHUB.md
   ```

3. **Push:**
   ```bash
   git push origin main
   ```

---

**Última atualização**: Janeiro 2026
