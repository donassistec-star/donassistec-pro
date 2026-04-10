# Diagramas - PRIO 2 Histórico de Preços

Este arquivo contém diagramas visuais da arquitetura e fluxo do sistema de histórico de preços.

## 1. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  PriceAnalyticsView.tsx                                     │
│  ├─ Summary Cards (Números/Stats)                           │
│  ├─ Relatório Diário (ComposedChart: Bar + Line)           │
│  ├─ Serviços Voláteis (Table)                              │
│  └─ Top Mudanças (2x Cards com Badges)                     │
├─────────────────────────────────────────────────────────────┤
│  retailerPriceTablesService.ts                              │
│  ├─ getPriceHistory()                                       │
│  ├─ getPriceTrend()                                         │
│  ├─ getPriceStats()                                         │
│  ├─ getDailyReport()                                        │
│  ├─ getVolatileServices()                                   │
│  ├─ getTopIncreases()                                       │
│  └─ getTopDecreases()                                       │
├─────────────────────────────────────────────────────────────┤
│                    HTTP API Layer                           │
│  GET /api/retailer-price-tables/admin/:slug/analytics/*    │
├─────────────────────────────────────────────────────────────┤
│ Backend Express Router (retailerPriceTables.ts)            │
│ ├─ requireAdmin middleware                                  │
│ ├─ authenticateToken middleware                             │
│ └─ Routing ← RetailerPriceTableController                   │
├─────────────────────────────────────────────────────────────┤
│ RetailerPriceTableController (7 novos endpoints)           │
│ ├─ getPriceHistory()     → Model.getTablePriceHistory()    │
│ ├─ getPriceTrend()       → Model.getServicePriceTrend()    │
│ ├─ getPriceStats()       → Model.getPriceChangeStats()     │
│ ├─ getDailyReport()      → Model.getDailyChangeReport()    │
│ ├─ getVolatileServices() → Model.getMostVolatileServices() │
│ ├─ getTopIncreases()     → Model.getPriceIncreases()       │
│ └─ getTopDecreases()     → Model.getPriceDecreases()       │
├─────────────────────────────────────────────────────────────┤
│ RetailerPriceHistoryModel (8 métodos SQL)                  │
│ ├─ recordPriceChanges()                                     │
│ ├─ getServicePriceTrend()                                   │
│ ├─ getTablePriceHistory()                                   │
│ ├─ getDailyChangeReport()                                   │
│ ├─ getMostVolatileServices()                                │
│ ├─ getPriceIncreases()                                      │
│ ├─ getPriceDecreases()                                      │
│ └─ getPriceChangeStats()                                    │
├─────────────────────────────────────────────────────────────┤
│                Database Layer (MySQL)                       │
│ ├─ retailer_price_history (tabela principal)               │
│ ├─ v_retailer_price_trends (vista analítica 1)             │
│ ├─ v_retailer_price_stats_daily (vista analítica 2)        │
│ └─ v_retailer_price_variance (vista analítica 3)           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Fluxo de Mudança de Preço

```
USER ACTION:
Admin edita tabela de preço e clica "Salvar"
        ↓
API REQUEST:
PUT /api/retailer-price-tables/admin/samsung-devices
{
  "title": "Samsung Devices 2024",
  "rawText": "... preços atualizados ...",
  "effectiveDate": "2024-12-01"
}
        ↓
BACKEND PROCESSING:
RetailerPriceTableController.upsert()
  1. Valida entrada (validateRetailerPriceTable)
  2. Faz PARSE do rawText → parsed_data
  3. Salva em DB (RetailerPriceTableModel.upsert)
  4. Incrementa version
  5. Registra changed_by + change_reason
        ↓
CAPTURE DELTA:
if (oldRecord exists) {
  oldPrices = extractPricesFromParsed(oldRecord)
  newPrices = extractPricesFromParsed(record)
  changes = compareSnapshots(oldPrices, newPrices)
}
        ↓
RECORD HISTORY:
Para cada mudança:
  INSERT INTO retailer_price_history (
    table_id, date, service_key, service_name,
    old_price, new_price, price_change_percent,
    price_change_amount, admin_user_id, change_source
  )
        ↓
VIEWS UPDATED:
MySQL atualiza automaticamente:
  - v_retailer_price_trends
  - v_retailer_price_stats_daily
  - v_retailer_price_variance
        ↓
RESPONSE:
HTTP 200 {
  "success": true,
  "data": record,
  "message": "Tabela salva com sucesso"
}
        ↓
FRONTEND UPDATE:
Frontend recebe resposta, pode:
  1. Mostrar toast de sucesso
  2. Recarregar página
  3. Atualizar analytics view
```

## 3. Integração com Versionamento (PRIO 1)

```
VERSIONING (PRIO 1):
┌─────────────────────────────────────┐
│ retailer_price_tables               │
├─────────────────────────────────────┤
│ id, slug, title, version            │
│ raw_text (completo)                 │
│ changed_by, change_reason           │
└─────────────────────────────────────┘
              ↓ (1:N)
┌─────────────────────────────────────┐
│ retailer_price_tables_history       │
├─────────────────────────────────────┤
│ version, table_id, snapshot         │
│ Trigger: auto-save antes UPDATE     │
└─────────────────────────────────────┘

PRICE HISTORY (PRIO 2):
┌─────────────────────────────────────┐
│ retailer_price_history              │
├─────────────────────────────────────┤
│ serviço-por-serviço delta           │
│ old_price, new_price, change_%     │
│ date, admin_user_id                │
└─────────────────────────────────────┘

RELAÇÃO:
when UPDATE retailer_price_tables:
  1. Trigger: snapshot → history table (PRIO 1)
  2. Application: delta → price_history table (PRIO 2)
  3. Both run in transaction
  4. Views updated automatically
```

## 4. Fluxo de Analytics

```
FRONTEND REQUEST:
┌─ GET /analytics/stats?days=30
│
├─ GET /analytics/daily?startDate=...&endDate=...
│
├─ GET /analytics/volatile?limit=20
│
├─ GET /analytics/increases?days=30
│
└─ GET /analytics/decreases?days=30

        ↓ [Parallel Requests]

BACKEND PROCESSING:
┌─ RetailerPriceHistoryModel.getPriceChangeStats(tableId, days)
│  SELECT aggregated stats from retailer_price_history
│  WHERE table_id = ? AND date >= DATE_SUB(NOW(), ?)
│  
├─ Model.getDailyChangeReport(tableId, startDate, endDate)
│  SELECT from retailer_price_history GROUP BY date
│  CalC: COUNT, SUM, AVG per day
│  
├─ Model.getMostVolatileServices(tableId, limit)
│  SELECT from retailer_price_history
│  GROUP BY service_key
│  Calculate: stdev, price_range, volatility_%
│  ORDER BY volatility_percent DESC
│  
├─ Model.getPriceIncreases(tableId, days, limit)
│  SELECT WHERE price_change_percent > 0
│  ORDER BY change_percent DESC
│  
└─ Model.getPriceDecreases(tableId, days, limit)
   SELECT WHERE price_change_percent < 0
   ORDER BY change_percent ASC

        ↓ [Format Responses]

HTTP 200 JSON {
  "success": true,
  "data": [ ... ],
  "message": "..."
}

        ↓ [Frontend Rendering]

PriceAnalyticsView:
├─ Summary Cards (display stats)
├─ ComposedChart (daily report)
├─ Volatile Services Table
├─ Top Increases List
└─ Top Decreases List
```

## 5. Estrutura de Dados

```
PRICE HISTORY ROW:
┌─────────────────────────────────────────┐
│ id: 42                                  │
│ table_id: 5                 ← FK         │
│ date: "2024-12-01"          ← Query key │
│ service_key:                            │
│   "samsung_a15_troca_vidro" ← Normalized│
│ service_name:                           │
│   "Samsung A15 > Troca de Vidro"       │
│ old_price: 120.00           ← NULL if new│
│ new_price: 135.00           ← Always set │
│ price_change_percent: 12.50 ← Computed  │
│ price_change_amount: 15.00  ← Computed  │
│ admin_user_id: 2            ← Audit     │
│ change_source: "manual_edit"← Audit     │
│ notes: "Ajuste trimestral"  ← Optional  │
│ recorded_at: timestamp      ← When      │
└─────────────────────────────────────────┘

PRICE STATS RESULT:
{
  total_changes: 156,            ← SUM(count)
  unique_services: 28,           ← COUNT DISTINCT
  total_increases: 98,           ← SUM WHERE > 0
  total_decreases: 58,           ← SUM WHERE < 0
  avg_increase_percent: 7.32,    ← AVG of positive
  avg_decrease_percent: -4.18,   ← AVG of negative
  max_increase_percent: 25.5,    ← MAX
  max_decrease_percent: -18.25,  ← MIN (negativo)
  total_increase_value: 2345.50, ← SUM positive
  total_decrease_value: 1832.75  ← SUM|negative|
}

DAILY REPORT ROW:
{
  date: "2024-12-01",
  services_changed: 15,          ← COUNT DISTINCT
  price_increases: 9,            ← SUM WHERE > 0
  price_decreases: 6,            ← SUM WHERE < 0
  avg_change_percent: 5.23,      ← AVG|change_%|
  total_increase_amount: 150.00,  ← SUM positive
  total_decrease_amount: 85.50    ← SUM|negative|
}

VOLATILE SERVICE ROW:
{
  service_key: "samsung_a15_...",
  service_name: "Samsung A15 > ...",
  change_count: 12,              ← Total changes
  avg_price: 132.50,             ← AVG new_price
  min_price: 110.00,             ← MIN new_price
  max_price: 150.00,             ← MAX new_price
  price_range: 40.00,            ← MAX - MIN
  volatility_percent: 15.18,      ← (range/avg)*100
  last_changed: "2024-12-20",
  first_recorded: "2024-10-01"
}
```

## 6. Índices e Performance

```
TABLE: retailer_price_history

INDEX 1: PRIMARY KEY (id)
  SELECT * WHERE id = ? 
  Performance: O(log n)

INDEX 2: unique_price_history
  UNIQUE (table_id, date, service_key)
  Purpose: Evitar duplicatas
  Performance: O(1) lookup

INDEX 3: idx_table_date
  (table_id, date DESC)
  Purpose: Queries por tabela e período
  Common: WHERE table_id = ? AND date >= ?
  Performance: O(log n)

INDEX 4: idx_service_key
  (service_key)
  Purpose: Busca por serviço específico
  Performance: O(log n)

INDEX 5: idx_change_percent
  (price_change_percent)
  Purpose: Ordenação por % para top/bottom
  Performance: O(log n)

INDEX 6: idx_recorded_at
  (recorded_at DESC)
  Purpose: Últimas mudanças, pagination
  Performance: O(log n)

INDEX 7: idx_admin_user
  (admin_user_id)
  Purpose: Auditoria por usuário
  Performance: O(log n)

TYPICAL QUERIES:
  Scan: 156 rows
  Lookup: < 1ms
  GROUP BY: < 10ms
  MAX: < 50ms for 90-day period
```

## 7. Componente React - State Flow

```
PriceAnalyticsView.tsx

INITIAL STATE:
stats = null
dailyReport = []
volatileServices = []
topIncreases = []
topDecreases = []
days = 30
loading = true
error = null

        ↓ useEffect([slug, days])

loadAnalytics():
  loading = true
  
  Promise.all([
    getPriceStats(slug, days),
    getDailyReport(slug),
    getVolatileServices(slug),
    getTopIncreases(slug, days),
    getTopDecreases(slug, days)
  ])
  
        ↓ (Parallel fetching)

RENDER (while loading):
├─ Summary: Skeleton × 5
├─ Chart: Skeleton
├─ Volatile: Skeleton
└─ Top Changes: Skeleton × 2

        ↓ (Data received)

UPDATE STATE:
stats ← statsData
dailyReport ← dailyData
volatileServices ← volatileData
topIncreases ← increasesData
topDecreases ← decreasesData
loading = false

        ↓ RENDER (with data)

├─ Summary Cards
│  ├─ total_changes (number)
│  ├─ total_increases (green)
│  ├─ total_decreases (red)
│  ├─ max_increase_percent (green)
│  └─ max_decrease_percent (red)
│
├─ Tabs
│  ├─ Daily Report
│  │  └─ ComposedChart
│  │     ├─ Bar: services_changed, increases, decreases
│  │     └─ Line: avg_change_percent
│  │
│  ├─ Volatile Services
│  │  └─ Table with service_name, metrics
│  │
│  └─ Top Changes
│     ├─ Top Increases (green badge)
│     └─ Top Decreases (red badge)
│
└─ Period Selector
   Buttons: 7d, 30d, 90d, 365d
   onClick → days = N → useEffect triggers
```

## 8. SQL Query Examples

```sql
-- Calculate price stats for 30 days
SELECT 
  COUNT(*) as total_changes,
  COUNT(DISTINCT service_key) as unique_services,
  SUM(CASE WHEN price_change_percent > 0 THEN 1 ELSE 0 END) as total_increases,
  SUM(CASE WHEN price_change_percent < 0 THEN 1 ELSE 0 END) as total_decreases,
  AVG(CASE WHEN price_change_percent > 0 
      THEN price_change_percent ELSE NULL END) as avg_increase_percent,
  MAX(CASE WHEN price_change_percent > 0 
      THEN price_change_percent ELSE NULL END) as max_increase_percent
FROM retailer_price_history
WHERE table_id = 5 
  AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY);

Result: Stats for single row

-- Daily aggregation
SELECT 
  date,
  COUNT(DISTINCT service_key) as services_changed,
  SUM(CASE WHEN price_change_percent > 0 THEN 1 ELSE 0 END) as price_increases,
  AVG(ABS(price_change_percent)) as avg_change_percent,
  SUM(CASE WHEN price_change_amount > 0 
      THEN price_change_amount ELSE 0 END) as total_increase_amount
FROM retailer_price_history
WHERE table_id = 5
GROUP BY date
ORDER BY date DESC;

Result: Multiple rows (1 per day)

-- Most volatile services
SELECT 
  service_key,
  service_name,
  COUNT(*) as change_count,
  (MAX(new_price) - MIN(new_price)) as price_range,
  ((MAX(new_price) - MIN(new_price)) / AVG(new_price) * 100) as volatility_percent
FROM retailer_price_history
WHERE table_id = 5
GROUP BY service_key, service_name
HAVING change_count > 1
ORDER BY volatility_percent DESC
LIMIT 20;

Result: Top 20 volatile services
```

## 9. Error Handling Flow

```
Frontend Request
  ↓
[try] HTTP call to API
  ↓
  ├─ [catch] Network error → error = "Erro ao conectar"
  │
  ├─ [200] Response { success: true, data: [...] }
  │   └─ Return data to component
  │
  └─ [401/403] Unauthorized
      └─ error = "Não autorizado" or "Token inválido"
      
Component [if error]
  ↓
Render Card className="border-red-200 bg-red-50"
  ├─ CardHeader: "Erro ao carregar análises"
  └─ CardContent: error message
  
User sees: Red error card with message
```

## 10. Checklist de Implementação

```
BACKEND:
  ☑ Migração SQL 37 criada
  ☑ priceHistoryUtils.ts com 5 funções
  ☑ RetailerPriceHistoryModel com 8 métodos
  ☑ RetailerPriceTableController+ 7 endpoints
  ☑ Rotas configuradas
  ☑ Error handling

FRONTEND:
  ☑ Interfaces no service (5 tipos)
  ☑ 7 métodos API no service
  ☑ PriceAnalyticsView component criado
  ☑ Recharts charts renderizando
  ☑ Tabs navigation funcional
  ☑ Period selector
  ☑ Loading/error states
  ☑ Responsive layout

DOCUMENTAÇÃO:
  ☑ IMPLEMENTACAO_PRIO2_PRECO_HISTORY.md
  ☑ GUIA_INTEGRACAO_PRICE_ANALYTICS.md
  ☑ DIAGRAMAS_PRIO2.md (este arquivo)
```
