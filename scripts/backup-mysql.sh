#!/bin/bash

# Script de Backup - Banco de Dados MySQL DonAssistec
# Data: $(date +%Y-%m-%d_%H%M%S)

set -e

# Configurações
BACKUP_DIR="/home/DonAssistec/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="donassistec_db"
DB_USER="donassistec_user"
DB_PASS="donassistec_password"
DB_HOST="127.0.0.1"
DB_PORT="3307"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

echo "========================================="
echo "  INICIANDO BACKUP DO BANCO DE DADOS"
echo "========================================="
echo "Data: $(date)"
echo "Banco: $DB_NAME"
echo "Destino: $BACKUP_FILE"
echo ""

# Executar backup
echo ">> Criando backup..."
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verificar se o backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "✅ Backup criado com sucesso!"
    echo "   Arquivo: $BACKUP_FILE"
    echo "   Tamanho: $SIZE"
    echo ""
    
    # Manter apenas os últimos 7 backups
    echo ">> Limpando backups antigos (mantendo últimos 7)..."
    ls -1t "$BACKUP_DIR/${DB_NAME}"_*.sql.gz | tail -n +8 | xargs -r rm -f
    echo "   Limpeza concluída."
else
    echo ""
    echo "❌ ERRO: Falha ao criar backup!"
    exit 1
fi

echo ""
echo "========================================="
echo "  BACKUP CONCLUÍDO COM SUCESSO"
echo "========================================="