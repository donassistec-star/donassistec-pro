# Guia Rápido: Push para GitHub

Este guia mostra como fazer push de todas as mudanças para o GitHub de forma segura.

## ⚠️ Verificação Pré-Push

### 1. Verificar Arquivos Sensíveis

```bash
# Verificar se .env não será commitado
git status | grep .env

# Se aparecer, NÃO FAÇA PUSH!
# Remova do staging:
git reset HEAD .env
```

### 2. Verificar Arquivos Grandes

```bash
# Verificar arquivos grandes (>5MB)
find . -type f -size +5M | grep -v node_modules | grep -v .git
```

### 3. Build de Teste

```bash
# Testar build do backend
cd backend
npm run build

# Testar build do frontend
cd ..
npm run build
```

## 🚀 Push Passo a Passo

### Opção 1: Commit Individual (Recomendado)

```bash
# 1. Verificar status
git status

# 2. Adicionar documentação primeiro
git add README.md INSTALLATION.md GITHUB_SETUP.md CONTRIBUTING.md CHANGELOG.md PROJECT_SUMMARY.md API_ROUTES.md PUSH_TO_GITHUB.md

# 3. Commit de documentação
git commit -m "docs: Adicionar documentação completa do projeto"

# 4. Adicionar arquivos de configuração
git add .gitignore .env.example backend/.env.example backend/uploads/.gitkeep

# 5. Commit de configuração
git commit -m "chore: Adicionar arquivos de exemplo e configuração"

# 6. Adicionar componentes novos
git add src/components/Favicon.tsx src/hooks/useSettings.ts

# 7. Commit de funcionalidades
git commit -m "feat: Adicionar favicon dinâmico e hook de configurações"

# 8. Adicionar migrations
git add backend/database/migrations/19_contact_settings.sql backend/database/migrations/20_branding_settings.sql

# 9. Commit de migrations
git commit -m "feat: Adicionar migrations para contato e branding"

# 10. Adicionar melhorias nos componentes
git add src/components/Header.tsx src/components/Footer.tsx src/components/CTASection.tsx src/components/WhatsAppFloat.tsx

# 11. Commit de melhorias
git commit -m "feat: Implementar logo dinâmico, informações de contato configuráveis e busca automática de CEP"

# 12. Adicionar melhorias no backend
git add backend/src/models/SettingsModel.ts backend/src/controllers/SettingsController.ts backend/src/routes/settings.ts

# 13. Commit de backend
git commit -m "feat: Adicionar histórico de configurações e validações melhoradas"

# 14. Adicionar página de settings
git add src/pages/admin/AdminSettings.tsx

# 15. Commit de settings
git commit -m "feat: Evoluir módulo de configurações com branding, contato e validações"

# 16. Adicionar utilitários
git add src/utils/validation.ts

# 17. Commit de utilitários
git commit -m "feat: Adicionar funções de validação CEP e WhatsApp URL"

# 18. Adicionar outros arquivos modificados
git add .

# 19. Verificar o que será commitado
git status

# 20. Commit final
git commit -m "chore: Atualizar dependências e ajustes diversos"

# 21. Push para GitHub
git push origin main
```

### Opção 2: Commit Único (Rápido)

```bash
# 1. Adicionar tudo
git add .

# 2. Verificar o que será commitado
git status

# 3. Commit único
git commit -m "feat: Sistema completo com branding, contato configurável, CEP automático e documentação completa

- Adicionar módulo de branding (logo, favicon, cores)
- Implementar gerenciamento de contato e mídias sociais
- Adicionar busca automática de CEP via ViaCEP
- Criar componente Favicon dinâmico
- Melhorar validações e tratamento de erros
- Corrigir CORS e URLs de imagens
- Adicionar documentação completa (README, INSTALLATION, etc)
- Adicionar guias de contribuição e GitHub setup"

# 4. Push
git push origin main
```

## ✅ Verificação Pós-Push

### 1. Verificar no GitHub

1. Acesse seu repositório no GitHub
2. Verifique se todos os arquivos foram enviados
3. Confirme que `.env` NÃO está visível
4. Verifique se `README.md` está sendo exibido

### 2. Testar Clone

```bash
# Em outro diretório, teste clonar
cd /tmp
git clone git@github.com:Ronei-rcm/donassistec.git
cd donassistec
ls -la
```

## 🔍 Checklist Final

Antes de fazer push, confirme:

- [ ] `.env` NÃO está no staging
- [ ] `.env.example` existe e está commitado
- [ ] `README.md` está atualizado
- [ ] Documentação completa criada
- [ ] `.gitignore` configurado corretamente
- [ ] Sem arquivos grandes (>100MB)
- [ ] Build funciona localmente
- [ ] Sem senhas ou tokens hardcoded

## 🐛 Problemas Comuns

### Erro: "rejected non-fast-forward"

```bash
# Puxar mudanças primeiro
git pull origin main --rebase

# Depois fazer push
git push origin main
```

### Erro: "Large files detected"

```bash
# Verificar arquivo grande
git ls-files | xargs du -h | sort -h | tail -10

# Se necessário, usar Git LFS
git lfs install
git lfs track "*.zip"
git lfs track "*.pdf"
```

### Remover arquivo do último commit

```bash
# Remover arquivo sem fazer novo commit
git reset HEAD~1
git add .  # menos o arquivo que quer remover
git commit -m "mensagem"
```

## 📝 Comandos Úteis

```bash
# Ver histórico de commits
git log --oneline -10

# Ver diferenças antes de commit
git diff

# Ver o que será commitado
git status

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Ver remotes configurados
git remote -v
```

---

**Pronto!** Após fazer o push, seu projeto estará no GitHub! 🎉
