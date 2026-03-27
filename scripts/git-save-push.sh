#!/usr/bin/env bash
# Salva e envia o projeto para o Git (add, commit, pull --rebase, push).
# Uso: ./scripts/git-save-push.sh [mensagem de commit]
#      ./scripts/git-save-push.sh "feat: nova funcionalidade"
#      ./scripts/git-save-push.sh   (usa "chore: save and push")

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "📁 Repositório: $REPO_ROOT"
echo ""

# 1. Verificar se é um repositório git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Erro: este diretório não é um repositório Git."
  exit 1
fi

BRANCH="$(git branch --show-current)"
echo "🌿 Branch: $BRANCH"
echo ""

# 2. Adicionar todas as alterações
echo "📦 Adicionando alterações (git add -A)..."
git add -A

# 3. Verificar se .env foi acidentalmente adicionado (não deve ser commitado)
if git diff --cached --name-only | grep -q '^\.env$'; then
  echo "⚠️  .env está no staging. Removendo (nunca commite .env)."
  git restore --staged .env 2>/dev/null || true
fi

# 4. Commit somente se houver alterações staged
if ! git diff --cached --quiet 2>/dev/null; then
  MSG="${1:-chore: save and push}"
  echo "💾 Commit: $MSG"
  git commit -m "$MSG"
  echo ""
else
  echo "ℹ️  Nenhuma alteração para commitar (working tree limpo)."
  echo ""
fi

# 5. Buscar e integrar alterações remotas (rebase para histórico linear)
echo "⬇️  Buscando alterações do remote (git pull --rebase origin $BRANCH)..."
if ! git pull --rebase "origin" "$BRANCH"; then
  echo ""
  echo "❌ Conflitos no rebase. Resolva com:"
  echo "   git status"
  echo "   # edite os arquivos em conflito, depois:"
  echo "   git add <arquivos>"
  echo "   git rebase --continue"
  echo "   ./scripts/git-save-push.sh   # tente novamente"
  exit 1
fi
echo ""

# 6. Enviar para o remote
echo "⬆️  Enviando para origin/$BRANCH (git push)..."
git push "origin" "$BRANCH"
echo ""
echo "✅ Projeto salvo e enviado para o Git."
echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'origin')"
