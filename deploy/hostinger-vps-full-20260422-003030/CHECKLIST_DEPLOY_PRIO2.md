# Checklist de Deploy - PRIO 2 Histórico de Preços

**Release**: v1.0 Histórico de Preços (PRIO 2)  
**Data**: Dezembro 2024  
**Responsável**: __________________  

## 📋 Pré-Deploy Checks

### 1. Code Review
- [ ] Todos os arquivos revisados
- [ ] Sem console.log de debug restantes
- [ ] Sem TODO/FIXME comentários
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Linting passa (`eslint src/`)

```bash
# Executar antes de deploy
npm run lint
npm run build
```

### 2. Testes
- [ ] Todos os 15 testes funcionais passam
- [ ] Nenhum teste de regressão quebrado
- [ ] Performance dentro dos limites
- [ ] Mobile responsivo verificado

Ver: GUIA_TESTES_PRIO2.md

### 3. Documentação
- [ ] README.md atualizado
- [ ] CHANGELOG.md tem entrada
- [ ] Migration 37 documentada
- [ ] API docs atualizadas

### 4. Database
- [ ] Migration 37 validada
- [ ] Backup do banco feito
- [ ] Migração pode ser revertida (rollback script)
- [ ] Views criadas corretamente
- [ ] Índices present (7 total)

```sql
-- Validar antes de deploy
SELECT COUNT(*) FROM information_schema.TABLES 
WHERE TABLE_NAME IN ('retailer_price_history', 'v_retailer_price_trends', 'v_retailer_price_stats_daily', 'v_retailer_price_variance');
-- Deve retornar 4

SELECT COUNT(*) FROM information_schema.STATISTICS 
WHERE TABLE_NAME = 'retailer_price_history';
-- Deve retornar 7 (índices)
```

### 5. Security
- [ ] Sem hardcoded credentials
- [ ] CORS configurado corretamente
- [ ] Authentication presente em todos endpoints
- [ ] Rate limiting considerado
- [ ] SQL injection prevention confirmado

```bash
# Verificar por secrets
grep -r "password:" backend/src/
grep -r "token=" backend/src/
# Não deve retornar nada versioned
```

### 6. Performance
- [ ] Queries otimizadas (< 100ms)
- [ ] Índices estratégicos
- [ ] Sem N+1 problems
- [ ] Bundle size OK (<1MB)

## 🔄 Deployment Process

### Phase 1: Staging Deployment (T-1 dia)

#### 1.1 Backend Staging
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations
npm run migrate
# Verifica se migration 37 roda sem erro

# 4. Build backend
npm run build

# 5. Test endpoints
curl -X GET http://staging-api:8000/api/retailer-price-tables/admin/TEST/analytics/stats

# 6. Start backend
npm run dev
```

**Success Criteria**:
- [ ] Backend inicia sem erros
- [ ] Endpoints acessíveis
- [ ] Database conectado
- [ ] Logs mostram "Migration 37 executed"

#### 1.2 Frontend Staging
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build production
npm run build

# 4. Test build
npm run preview

# 5. Test component carrega
# Open browser: http://staging:8200/admin/price-analytics/test
```

**Success Criteria**:
- [ ] Build completa sem erros
- [ ] Zero TypeScript errors
- [ ] UI renderiza sem console errors
- [ ] Gráficos carregam dados

#### 1.3 Integration Testing
```bash
# Executar testes de integração
npm run test

# Manual testing
# 1. Edit tabela de teste
# 2. Salve com preço diferente
# 3. Verifique histórico capturado
# 4. Abra analytics
# 5. Verifique gráficos
```

**Success Criteria**:
- [ ] Todos testes passam
- [ ] Manual testing OK
- [ ] Sem regressions
- [ ] Performance OK

### Phase 2: Production Deployment (Planning)

#### 2.1 Pre-Production Verification (T-6h)
```bash
# 1 Verificar status staging
curl http://staging-api:8000/health
# Deve retornar { "status": "ok" }

# 2 Verificar dados
curl -X GET http://staging-api:8000/api/retailer-price-tables/admin/test/analytics/stats
# Deve retornar dados válidos

# 3 Verificar performance
# Load test tool: wrk, ab, ou LoadRunner
ab -n 100 -c 10 http://staging-api:8000/api/retailer-price-tables/admin/test/analytics/stats
# Deve responder em < 100ms

# 4 Backup completo
mysqldump -u root -p production_db > backup_prio2_$(date +%Y%m%d_%H%M%S).sql
```

**Success Criteria**:
- [ ] Health check OK
- [ ] Dados acessíveis
- [ ] Performance dentro target
- [ ] Backup criado

#### 2.2 Deployment Window (T-0, Minutos 0-15)
```bash
# TODO: Executar durante janela de manutenção (02:00-05:00)

# 1. Stop backend gracefully (T+0min)
pm2 stop "donassistec-api"
# Aguarda conexões ativas finalizarem (~30sec)

# 2. Database migration (T+2min)
mysql -u root -p production_db < migrations/37_retailer_price_history.sql
# Verifica: Tables created, views created, indexes created

# 3. Deploy backend (T+3min)
cd /app/backend
git pull origin main  
npm install
npm run build
pm2 start "donassistec-api"  # Restart

# 4. Verify backend (T+5min)
curl http://api.donassistec.com.br/health
# Retry 3 vezes se falhar

# 5. Deploy frontend (T+10min)
cd /app/frontend
git pull origin main
npm install
npm run build
# Upload para CDN/hosting
sudo cp -r dist/* /var/www/html/

# 6. Purge cache (T+12min)
curl -X PURGE https://api.donassistec.com.br/cache
curl -X PURGE https://cdn.donassistec.com.br

# 7. Smoke tests (T+13min)
curl https://api.donassistec.com.br/api/retailer-price-tables/admin/test/price-history
# Verifica status 200

# 8. Health check (T+15min)
# Monitor dashboard por 5 minutos
# Verifica: erro rates, latency, DB connections
```

**Success Criteria**:
- [ ] Backend started successfully
- [ ] Database migration completed
- [ ] All endpoints respond 200
- [ ] No 500 errors in logs
- [ ] Frontend loads without errors

#### 2.3 Post-Deployment Verification (T+30min)
```bash
# 1. Monitor logs
tail -f /var/log/donassistec/app.log | grep -i error

# 2. Check database
SELECT COUNT(*) FROM retailer_price_history;
# Deve ter dados

# 3. Test API endpoints
# Endpoint 1: GET /price-history
curl https://api.donassistec.com.br/api/retailer-price-tables/admin/samsung/price-history

# Endpoint 2: GET /analytics/stats
curl https://api.donassistec.com.br/api/retailer-price-tables/admin/samsung/analytics/stats

# Endpoint 3: GET /analytics/daily
curl https://api.donassistec.com.br/api/retailer-price-tables/admin/samsung/analytics/daily

# Endpoint 4: GET /analytics/volatile
curl https://api.donassistec.com.br/api/retailer-price-tables/admin/samsung/analytics/volatile

# 4. Test UI
# Browser: https://admin.donassistec.com.br/price-analytics/samsung
# Verifique: Cards carregam, gráficos renderizam

# 5. Monitor performance alerts
# Verificar: CPU < 80%, Memory < 85%, Response time < 100ms

# 6. Notify stakeholders
# Enviar: "PRIO 2 Deploy Concluído - Status: OK"
```

**Success Criteria**:
- [ ] Sem erros críticos nos logs
- [ ] Database intacto
- [ ] Todos endpoints retornam 200
- [ ] UI carrega perfeitamente
- [ ] Performance dentro limites

### Phase 3: Rollback Plan (Se necessário)

#### 3.1 Rollback Automático (Se detectado)
```bash
# Se detectado erro crítico (dentro 10min):
# 1. Backend rollback
git revert <commit-hash>
npm run build
pm2 restart "donassistec-api"

# 2. Frontend rollback
git revert <commit-hash>
npm run build
# Redeploy versão anterior
```

#### 3.2 Database Rollback
```bash
# Se migration causou problema:
# 1. STOP BACKEND PRIMEIRO
pm2 stop "donassistec-api"

# 2. Restore backup
mysql -u root -p production_db < backup_prio2_YYYYMMDD_HHMMSS.sql

# 3. Verify data
SELECT COUNT(*) FROM retailer_price_tables;
# Deve retornar linhas

# 4. Restart backend
pm2 start "donassistec-api"
```

**Rollback Time**: ~5 minutos (com backup testeado)

## 📊 Monitoring Post-Deploy

### Alerts Configure

```yaml
# Monitor estas métricas por 24h após deploy
- api_response_time > 200ms  → Alert
- error_rate_5xx > 1%        → Alert  
- db_connection_pool > 90%   → Alert
- disk_usage > 90%           → Alert
- cpu_usage > 85%            → Alert
- memory_usage > 85%         → Alert
```

### Logs to Monitor
```bash
# Terminal 1: API errors
tail -f logs/app.log | grep -i error

# Terminal 2: Performance
tail -f logs/performance.log | grep -i "duration"

# Terminal 3: Database
tail -f logs/database.log | grep -i "error"
```

### User Feedback
- [ ] Monitorar emails de suporte
- [ ] Verificar fórum/chat de feedback
- [ ] Responder issues rapidamente
- [ ] Documentar problemas encontrados

## ✅ Sign-Off Checklist

### Release Manager
- [ ] Code review completo
- [ ] Testes passing
- [ ] Documentação atualizada
- [ ] Backup validado
- [ ] Rollback plan documentado

**Sign-off**: _________________ Data: __/__/____

### QA Lead
- [ ] Testes funcionais completos
- [ ] Testes de regressão OK
- [ ] Performance tests passed
- [ ] Security review OK

**Sign-off**: _________________ Data: __/__/____

### DevOps Lead
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Alertas funcionando
- [ ] Deployment scripts testados

**Sign-off**: _________________ Data: __/__/____

### Product Manager
- [ ] Features aprovadas
- [ ] Business requirements met
- [ ] User docs finalizados

**Sign-off**: _________________ Data: __/__/____

## 📝 Post-Deployment Report

### Deployment Details
```
Date: __/__/____
Time: ____:____ to ____:____ UTC
Duration: ______ minutes
Status: ☐ SUCCESS  ☐ PARTIAL  ☐ ROLLBACK
```

### Issues Encountered
```
[ ] None

[ ] 1. Issue: _______________________________
      Impact: _______________________________
      Resolution: ____________________________
      Time: ____ minutes

[ ] 2. Issue: _______________________________
      Impact: _______________________________
      Resolution: ____________________________
      Time: ____ minutes
```

### Performance Metrics
```
API Response Time (avg):    ____ms (target: <100ms)
Error Rate (5xx):           __%   (target: <0.1%)
Database Queries (avg):     ____ms (target: <50ms)
Frontend Load Time:         ____ms (target: <2s)
```

### User Feedback
```
Positive:
- _________________________________
- _________________________________

Issues:
- _________________________________
- _________________________________

Action Items:
- [ ] ______________________________
- [ ] ______________________________
```

### Approval for Production
- [ ] Dev environment OK
- [ ] Staging environment OK  
- [ ] Production deployment successful
- [ ] Monitoring validated
- [ ] Stakeholders notified

**Approved by**: _________________ Date: __/__/____

**Go Live Status**: ☐ LIVE  ☐ SCHEDULED  ☐ ROLLED BACK

---

## 🚀 Next Steps

### Immediately After (1h)
- [ ] Monitorar logs ativamente
- [ ] Responder rapidamente a issues
- [ ] Notificar time se problemas

### Day 1 (24h)
- [ ] Monitoring 24h de performance
- [ ] Colher feedback de usuários
- [ ] Documentar lessons learned

### Week 1 (7 dias)
- [ ] Análise completa de métricas
- [ ] Pensar em otimizações
- [ ] Preparar próxima feature

### Documentation Update
- [ ] Atualizar runbooks
- [ ] Documented - release notes publicamente
- [ ] Update status page CLI

---

**Deploy Checklist Completo!** ✨

Data: __/__/____  
Responsável: _________________  
Status: ☐ Pronto para Deploy  ☐ Aguardando Aprovação
