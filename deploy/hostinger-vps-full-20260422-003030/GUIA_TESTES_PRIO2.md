# Guia de Testes - PRIO 2 Histórico de Preços

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Objetivo**: Validar implementação de Histórico de Preços

## 🧪 Setup Inicial

### Pré-requisitos
- [ ] Backend rodando (`npm run dev` na pasta backend)
- [ ] Frontend rodando (`npm run dev` na pasta raiz)
- [ ] MySQL com migration 37 executada
- [ ] User admin logado
- [ ] Tabela de preço de teste criada

### Preparação de Dados
```bash
# Backend - Criar dados de teste
cd backend
npm run scripts create-test-user

# Frontend - Login como admin
# Usuario: admin@test.com
# Senha: test123
```

## 📋 Testes Funcionais

### Teste 1: Captura Automática de Mudança de Preço

**Pré-condição**: Estar logado como admin

**Passos**:
1. Navegar para Admin > Tabelas de Preço
2. Abrir tabela de teste "Samsung Devices"
3. NO editor, NO formulário, mudar um preço (ex: R$100 → R$150)
4. Clicar "Salvar"

**Esperado**:
- [ ] Toast "Tabela salva com sucesso"
- [ ] Página recarrega
- [ ] Version incrementa (ex: 5 → 6)

**Validação BD**:
```sql
SELECT * FROM retailer_price_history 
WHERE table_id = (SELECT id FROM retailer_price_tables WHERE slug='samsung-devices')
ORDER BY recorded_at DESC LIMIT 1;
```

**Esperado**:
- [ ] Registro existe com mudança capturada
- [ ] `old_price` = R$100
- [ ] `new_price` = R$150
- [ ] `price_change_percent` = 50.00
- [ ] `admin_user_id` = seu user ID
- [ ] `change_source` = "manual_edit"

---

### Teste 2: View Analytics - Summary Cards

**Pré-condição**: Histórico com dados do Teste 1

**Passos**:
1. Navegar para Admin > Tabelas > Analytics
2. Selecionar tabela "Samsung Devices"
3. Observe abas: Daily, Volatile, Top Changes
4. Clique em aba "Daily"

**Esperado**:
- [ ] 5 Summary cards carregam sem erro
- [ ] Números aparecem (podem ser 0 se primeiros dados)
- [ ] "Mudanças Totais" >= 1
- [ ] "Aumentos" card verde
- [ ] "Reduções" card vermelho
- [ ] Sem console errors

**Validação**:
```javascript
// Console browser
getComputedStyle(document.querySelector('[class*="text-green"]')).color
// Deve retornar cor verde RGB
```

---

### Teste 3: Gráfico Relatório Diário

**Pré-condição**: Analytics view carregado

**Passos**:
1. Dar click na aba "Daily Report"
2. Aguardar gráfico renderizar
3. Verificar eixos X e Y
4. Hover sobre barra do gráfico

**Esperado**:
- [ ] ComposedChart renderiza
- [ ] Eixo X: Datas em formato DD/MM
- [ ] Eixo Y esq: Números (serviços, aumentos, reduções)
- [ ] Eixo Y dir: Percentual
- [ ] Tooltip ao hover com dados
- [ ] Legenda embaixo (services_changed, increases, decreases, avg_change_percent)

**Validação**:
```javascript
// Console
document.querySelector('svg').getBoundingClientRect().width > 500
// True = gráfico renderizado com tamanho
```

---

### Teste 4: Serviços Voláteis

**Pré-condição**: Múltiplas mudanças de preço para mesmo serviço

**Preparação**:
```bash
# Editar tabela 5 vezes com DIFERENTES preços para mesmo serviço
# Preço inicial: R$100
# Mudança 1: R$120 (+20%)
# Mudança 2: R$95 (-20.8%)
# Mudança 3: R$150 (+57.9%)
# Mudança 4: R$110 (-26.7%)
```

**Passos**:
1. Aba "Volatile Services"
2. Procurar serviço "Samsung A15 > Troca Vidro"

**Esperado**:
- [ ] Serviço aparece na tabela
- [ ] "Change count" = 4 (número de mudanças)
- [ ] "Volatility %" calculado corretamente
- [ ] Min: R$95, Max: R$150
- [ ] Amplitude: R$55
- [ ] Tabela ordenada por volatilidade DESC

**Cálculo Manual**:
```
Amplitude = 150 - 95 = 55
Média = (100+120+95+150+110)/5 = 115
Volatility% = (55/115)*100 = 47.8%
```

---

### Teste 5: Top Aumentos/Reduções

**Pré-condição**: Dados do Teste 4

**Passos**:
1. Aba "Top Changes"
2. Verificar "Maiores Aumentos" (esquerda)
3. Verificar "Maiores Reduções" (direita)

**Esperado**:
- [ ] Tabela esquerda mostra aumentos com badge VERDE
- [ ] Tabela direita mostra reduções com badge VERMELHO
- [ ] Aumentos ordenado por % DESC (maior primeiro)
- [ ] Reduções ordenado por % ASC (maior redução primeiro)
- [ ] Cada linha mostra: nome, before→after, %, data

**Exemplo de Linha Aumentos**:
```
Samsung A15 > Troca Vidro
R$100.00 → R$150.00
+57.9% | 2024-12-01
```

---

### Teste 6: Seletor de Período

**Pré-condição**: View carregada

**Passos**:
1. Clique botão "7d"
2. Aguarde dados recarregarem
3. Verifique se números mudam
4. Repita para 30d, 90d, 365d

**Esperado**:
- [ ] Botão ativo muda cor
- [ ] Dados recarregam (~500ms)
- [ ] Números podem ser diferentes para cada período
- [ ] Sem duplicação de requisições (1 por período)

**Validação Network**:
```
Open DevTools > Network
Click "30d" button
Deve ter APENAS 1 requisição GET /analytics/*
NÃO deve ter duplicatas
```

---

### Teste 7: API Endpoint - getPriceHistory

**Pré-condição**: Backend rodando, dados existem

**Teste via CURL**:
```bash
TOKEN="seu_jwt_token"

curl -X GET "http://localhost:8000/api/retailer-price-tables/admin/samsung-devices/price-history?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "table_id": 5,
      "date": "2024-12-01",
      "service_key": "samsung_a15_troca_vidro",
      "service_name": "Samsung A15 > Troca de Vidro",
      "old_price": 100.00,
      "new_price": 150.00,
      "price_change_percent": 50.00,
      "price_change_amount": 50.00,
      "admin_user_id": 2,
      "change_source": "manual_edit",
      "recorded_at": "2024-12-01T10:30:00Z"
    }
  ],
  "message": "1 registros de mudança encontrados"
}
```

---

### Teste 8: API Endpoint - getPriceStats

**Teste via CURL**:
```bash
curl -X GET "http://localhost:8000/api/retailer-price-tables/admin/samsung-devices/analytics/stats?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "success": true,
  "data": {
    "total_changes": 4,
    "unique_services": 1,
    "total_increases": 2,
    "total_decreases": 2,
    "avg_increase_percent": 38.95,
    "avg_decrease_percent": -23.75,
    "max_increase_percent": 57.9,
    "max_decrease_percent": -26.7,
    "total_increase_value": 77.9,
    "total_decrease_value": 24.75
  }
}
```

---

### Teste 9: API Endpoint - getDailyReport

**Teste via CURL**:
```bash
curl -X GET "http://localhost:8000/api/retailer-price-tables/admin/samsung-devices/analytics/daily" \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-12-01",
      "services_changed": 1,
      "price_increases": 1,
      "price_decreases": 0,
      "avg_change_percent": 50.00,
      "total_increase_amount": 50.00,
      "total_decrease_amount": 0.00
    }
  ]
}
```

---

### Teste 10: Responsividade Mobile

**Pré-condição**: View carregada

**Passos**:
1. DevTools > Toggle device toolbar (F12)
2. Selecionar "iPhone 12" ou "Pixel 5"
3. Scroll e verificar layout

**Esperado - Mobile (375px width)**:
- [ ] Summary cards empilhados verticalmente
- [ ] Gráfico redimensiona para largura disponível
- [ ] Colunas: 1 coluna (não 2)
- [ ] Texto legível (sem truncamento)
- [ ] Buttons acessíveis (tap target > 44px)

**Esperado - Tablet (768px)**:
- [ ] Summary cards em 2-3 colunas
- [ ] Gráfico maior que desktop

**Esperado - Desktop (1920px)**:
- [ ] Summary cards em 5 colunas
- [ ] Gráfico full-width

---

### Teste 11: Error Handling - Sem Dados

**Pré-condição**: Tabela sem histórico de preços

**Passos**:
1. Criar nova tabela de preço
2. Não editar (= sem mudanças)
3. Abri Analytics

**Esperado**:
- [ ] Summary cards podem exibir "0"
- [ ] Gráficos mostram "Nenhum dado"
- [ ] Sem console errors
- [ ] Sem hang/loading infinito

---

### Teste 12: Error Handling - 401 Unauthorized

**Pré-condição**: Qualquer page
**Passos**:
1. Logout (limpar token)
2. Tentar acessar `/admin/price-analytics`

**Esperado**:
- [ ] Redireciona para login
- [ ] Mensagem "Não autorizado"
- [ ] Sem componente renderizado

---

### Teste 13: Performance - Load Time

**Pré-condição**: Analytics view

**Passos**:
1. DevTools > Performance tab
2. Clique "Start recording"
3. Mudar período de 30d → 90d
4. Clique "Stop"

**Esperado**:
- [ ] Requisição para backend: < 100ms
- [ ] Renderização: < 500ms
- [ ] Total: < 1s
- [ ] Sem jank (frame drops)

---

### Teste 14: SQL Views - Verificar Criação

**Executar no MySQL**:
```sql
SHOW TABLES LIKE 'v_retailer_price%';
SHOW COLUMNS FROM v_retailer_price_trends;
SHOW COLUMNS FROM v_retailer_price_stats_daily;
SHOW COLUMNS FROM v_retailer_price_variance;
```

**Esperado**:
- [ ] 3 views existem
- [ ] Cada view tem columns esperadas
- [ ] Sem erros ao listar

---

### Teste 15: Índices - Verificar Performance

**Executar no MySQL**:
```sql
SHOW INDEX FROM retailer_price_history;
```

**Esperado**:
- [ ] 7 índices listados
- [ ] Cada com Seq_in_index correto
- [ ] PRIMARY key é primeiro

**Validação Performance**:
```sql
-- Deve ser MUITO rápido (< 10ms)
EXPLAIN SELECT * FROM retailer_price_history 
WHERE table_id = 5 AND date >= '2024-12-01' 
ORDER BY date DESC LIMIT 10;

-- Deve ter "Using index" ou "Using where, Using index"
```

---

## 🐛 Testes de Regressão

### REG-1: Editar tabela ainda funciona
**Esperado**:
- [ ] PUT /admin/:slug ainda salva
- [ ] Version incrementa (PRIO 1)
- [ ] Histórico capturado (PRIO 2)

### REG-2: Listar tabelas admin
**Esperado**:
- [ ] GET /admin lista tabelas
- [ ] Sem erros
- [ ] Ordenação mantida

### REG-3: Listar tabelas retailer
**Esperado**:
- [ ] GET /retailer lista visible tables
- [ ] Sem histórico exposto

### REG-4: Versionamento (PRIO 1) mantém funcionando
**Esperado**:
- [ ] GET /admin/:slug/history (versionamento)
- [ ] GET /admin/:slug/rollback (versionamento)
- [ ] Ambos funcionam independente

---

## ✅ Checklist Final

Executar antes de considerar pronto:

- [ ] Teste 1: Captura automática ✅
- [ ] Teste 2: Summary cards ✅
- [ ] Teste 3: Gráfico diário ✅
- [ ] Teste 4: Serviços voláteis ✅
- [ ] Teste 5: Top mudanças ✅
- [ ] Teste 6: Seletor período ✅
- [ ] Teste 7: API price-history ✅
- [ ] Teste 8: API stats ✅
- [ ] Teste 9: API daily ✅
- [ ] Teste 10: Mobile responsivo ✅
- [ ] Teste 11: Sem dados ✅
- [ ] Teste 12: Sem auth ✅
- [ ] Teste 13: Performance ✅
- [ ] Teste 14: Views criadas ✅
- [ ] Teste 15: Índices OK ✅
- [ ] REG-1: Editar tabela ✅
- [ ] REG-2: Listar admin ✅
- [ ] REG-3: Listar retailer ✅
- [ ] REG-4: Versionamento ✅

---

## 📊 Relatório de Testes

**Tester**: _________________  
**Data**: __/__/____  
**Resultado Global**: ☐ PASS  ☐ FAIL  

**Issues Encontradas**:
```
[ ] Nenhum
[ ] 1. (descrever)
[ ] 2. (descrever)
[ ] 3. (descrever)
```

**Observações**:
```
_________________________________
_________________________________
_________________________________
```

**Sign-off Tester**: _________________  
**Sign-off Product**: _________________

---

## 🔍 Troubleshooting

### Problema: "Cannot find module" error
**Solução**:
```bash
npm install
npm run dev
```

### Problema: Dados não aparecem
**Verificar**:
```sql
SELECT COUNT(*) FROM retailer_price_history;
-- Deve ter linhas
```

### Problema: Gráfico branco
**Verificar**:
```javascript
// Console
import('recharts').then(r => console.log(r))
// Deve log sem erro
```

### Problema: Tokens expirados
**Solução**:
```bash
# Logout e login novamente
# Ou remover localStorage
localStorage.clear()
```

---

## 📞 Contato

Para questões durante testes:
- Técnico: Verificar IMPLEMENTACAO_PRIO2_PRECO_HISTORY.md
- Integração: Verificar GUIA_INTEGRACAO_PRICE_ANALYTICS.md
- Diagramas: Verificar DIAGRAMAS_PRIO2.md

---

**Boa sorte com os testes!** 🚀
