#!/bin/bash
# Testa acesso à API (backend, nginx, HTTP/HTTPS). Rode no servidor: ./scripts/testar-api-acesso.sh

BASE="http://donassistec.com.br"
BASE_HTTPS="https://donassistec.com.br"
LOCAL_API="http://127.0.0.1:3001"
LOCAL_NGINX="http://127.0.0.1"

ok() { echo "  [OK] $1"; }
fail() { echo "  [FALHA] $1"; }

echo "=========================================="
echo "  TESTE DE ACESSO À API"
echo "=========================================="

# 1) Backend direto :3001
echo ""
echo "1) Backend :3001 (health)"
if c=$(curl -s -o /dev/null -w "%{http_code}" "$LOCAL_API/health" 2>/dev/null); then
  [ "$c" = "200" ] && ok "GET /health → $c" || fail "GET /health → $c"
else
  fail "Backend :3001 inacessível. Está rodando?"
fi

# 2) Backend :3001 /api/auth/login
echo ""
echo "2) Backend :3001 (POST /api/auth/login)"
if c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$LOCAL_API/api/auth/login" \
  -H "Content-Type: application/json" -d '{"email":"x","password":"y"}' 2>/dev/null); then
  [ "$c" = "401" ] && ok "POST /api/auth/login → $c (esperado para credenciais inválidas)" || fail "POST /api/auth/login → $c"
else
  fail "POST /api/auth/login inacessível"
fi

# 3) Nginx /api (HTTP 80)
echo ""
echo "3) Nginx /api via HTTP (porta 80)"
if c=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/login" -X POST \
  -H "Content-Type: application/json" -d '{"email":"x","password":"y"}' 2>/dev/null); then
  [ "$c" = "401" ] && ok "POST $BASE/api/auth/login → $c" || fail "POST $BASE/api/auth/login → $c (verifique nginx e proxy para :3001)"
else
  fail "HTTP :80 inacessível (nginx? firewall?)"
fi

# 4) HTTPS (443)
echo ""
echo "4) HTTPS (porta 443)"
if c=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$BASE_HTTPS/api/auth/login" -X POST \
  -H "Content-Type: application/json" -d '{"email":"x","password":"y"}' 2>/dev/null); then
  [ "$c" = "401" ] && ok "POST $BASE_HTTPS/api/auth/login → $c" || fail "POST $BASE_HTTPS → $c"
else
  fail "HTTPS :443 inacessível (nginx sem SSL? firewall? Veja nginx-vps-ssl.conf.example e certbot)"
fi

echo ""
echo "=========================================="
echo "  Resumo: veja TESTE-API-ACESSO.md"
echo "=========================================="
