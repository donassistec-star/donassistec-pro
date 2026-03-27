# Guia de Configuração do GitHub

Este guia explica como configurar e fazer push do projeto DonAssistec para o GitHub.

## 📋 Pré-requisitos

1. Conta no GitHub criada
2. Git instalado localmente
3. Acesso SSH configurado (ou use HTTPS)

## 🚀 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `donassistec`
   - **Description**: Sistema B2B de Gerenciamento de Peças e Serviços para Celulares
   - **Visibility**: Public ou Private (escolha conforme preferência)
   - **NÃO** marque "Initialize this repository with a README"
3. Clique em "Create repository"

### 2. Configurar Git Local (Primeira Vez)

```bash
# Na raiz do projeto
cd /home/DonAssistec

# Verificar se já é um repositório Git
git status

# Se não for, inicializar
git init

# Configurar usuário Git (se ainda não configurou)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 3. Verificar .gitignore

O arquivo `.gitignore` já deve estar configurado. Verifique se contém:

```
node_modules/
dist/
*.log
.env
.env.local
.env.*.local
backend/uploads/*
!backend/uploads/.gitkeep
```

### 4. Criar .gitkeep para Uploads

```bash
# Garantir que a pasta uploads existe mas o conteúdo não é commitado
touch backend/uploads/.gitkeep
```

### 5. Adicionar Arquivos ao Git

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer commit inicial


```

### 6. Conectar com Repositório Remoto

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/donassistec.git

# Ou usando SSH (se configurado)
# git remote add origin git@github.com:SEU_USUARIO/donassistec.git

# Verificar remote
git remote -v
```

### 7. Fazer Push para GitHub

```bash
# Push inicial para branch main
git branch -M main
git push -u origin main
```

### 8. Criar Arquivos Adicionais Recomendados

#### LICENSE

```bash
# Criar arquivo LICENSE (MIT é uma boa opção)
touch LICENSE
```

Adicione conteúdo da licença MIT ou outra de sua escolha.

#### .github/workflows (Opcional)

Para CI/CD, crie a pasta:

```bash
mkdir -p .github/workflows
```

## 📝 Commit e Push - Boas Práticas

### Estrutura de Commits

Use mensagens descritivas:

```bash
# Funcionalidade nova
git commit -m "feat: Adicionar sistema de cupons"

# Correção de bug
git commit -m "fix: Corrigir erro de CORS no upload"

# Documentação
git commit -m "docs: Atualizar guia de instalação"

# Refatoração
git commit -m "refactor: Otimizar queries do banco"

# Testes
git commit -m "test: Adicionar testes para models"
```

### Fluxo de Trabalho

```bash
# 1. Verificar status
git status

# 2. Adicionar arquivos específicos ou todos
git add .
# ou
git add arquivo_especifico.ts

# 3. Commit
git commit -m "Descrição clara da mudança"

# 4. Push
git push origin main

# 5. Se estiver trabalhando em branch separada
git checkout -b feature/nova-funcionalidade
# ... fazer mudanças ...
git add .
git commit -m "feat: Nova funcionalidade"
git push origin feature/nova-funcionalidade
# Depois criar Pull Request no GitHub
```

## 🔒 Segurança

### Arquivos Sensíveis

**NUNCA** commite:

- ❌ `.env` ou `.env.local`
- ❌ Senhas ou secrets
- ❌ Chaves privadas
- ❌ Credenciais de banco de dados
- ❌ Tokens de API

### Usar GitHub Secrets (para CI/CD)

Se usar GitHub Actions, configure secrets em:
Settings > Secrets and variables > Actions

### .env.example

Crie um arquivo `.env.example` com exemplos (sem valores reais):

```bash
# Backend
cp backend/.env backend/.env.example
# Remova valores sensíveis e mantenha apenas variáveis

# Frontend
cp .env .env.example
```

## 📚 Documentação no GitHub

### README.md

O README.md será exibido automaticamente na página principal do repositório.

### Adicionar Badges (Opcional)

Adicione badges no início do README:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)
```

### Adicionar Topics

No GitHub, adicione topics ao repositório:
- react
- typescript
- nodejs
- mysql
- b2b
- ecommerce
- dashboard

## 🔄 Sincronização Contínua

Depois do push inicial, sempre que fizer mudanças:

```bash
# Verificar mudanças
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição da mudança"

# Push
git push origin main
```

## 📦 Tags e Releases

Para criar releases versionadas:

```bash
# Criar tag
git tag -a v1.0.0 -m "Release versão 1.0.0"

# Push tag
git push origin v1.0.0

# Depois, criar release no GitHub:
# GitHub > Releases > Draft a new release > Escolher tag
```

## 🔍 Verificar Antes do Push

Antes de fazer push, verifique:

```bash
# Verificar arquivos que serão commitados
git status

# Ver diferenças
git diff

# Ver histórico de commits
git log --oneline -5
```

## 📞 Problemas Comuns

### Erro: "fatal: remote origin already exists"

```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU_USUARIO/donassistec.git
```

### Erro: "failed to push some refs"

```bash
# Puxar mudanças primeiro
git pull origin main --rebase

# Depois fazer push
git push origin main
```

### Arquivo muito grande

Se algum arquivo for muito grande (>100MB):

```bash
# Usar Git LFS (Large File Storage)
git lfs install
git lfs track "*.zip"
git lfs track "*.pdf"

# Ou remover do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch arquivo_grande.ext" \
  --prune-empty --tag-name-filter cat -- --all
```

## ✅ Checklist Final

Antes de fazer o primeiro push:

- [ ] `.gitignore` configurado corretamente
- [ ] Arquivos `.env` não estão sendo commitados
- [ ] `README.md` atualizado
- [ ] `INSTALLATION.md` criado
- [ ] `LICENSE` adicionado
- [ ] `.env.example` criado (com exemplos, sem valores reais)
- [ ] Sem arquivos sensíveis no commit
- [ ] Documentação completa
- [ ] Estrutura do projeto organizada

---

**Pronto!** Seu projeto está no GitHub e pronto para colaboração! 🎉
