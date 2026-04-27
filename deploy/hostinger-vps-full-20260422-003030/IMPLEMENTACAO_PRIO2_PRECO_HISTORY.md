# Implementação - Histórico de Preços (PRIO 2)

**Status**: ✅ IMPLEMENTAÇÃO COMPLETA
**Data**: Dezembro 2024
**Foco**: Analytics e rastreamento de mudanças de preço com visualizações

## 📋 Visão Geral

Implementação completa do sistema de **Histórico de Preços** para rastreamento e análise de mudanças de preço em tabelas de preço de varejo. Sistema integrado com versioning anterior (PRIO 1).

## 🔧 Componentes Implementados

### 1. Backend

#### 1.1 Utilitários - `priceHistoryUtils.ts`
Funções auxiliares para processamento de preços:

```typescript
export interface PriceHistoryRecord { }    // Registro de mudança de preço
export interface PriceChangeReport { }     // Relatório diário de mudanças
export interface ServicePriceVariance { }  // Volatilidade de serviço

// Funções principais:
- normalizeServiceKey()          // Samsung A15 > Troca de Vidro → samsung_a15_troca_de_vidro
- extractPricesFromParsed()      // Extrai map de preços da tabela parseada
- calculatePriceChange()         // Calcula % e valor absoluto de mudança
- compareSnapshots()             // Compara dois snapshots de preços
```

#### 1.2 Model - `RetailerPriceHistoryModel.ts`
Camada de modelo para operações com histórico de preços:

```typescript
class RetailerPriceHistoryModel {
  // Gravar mudanças
  recordPriceChanges(changes: PriceHistoryInput[])
    → INSERT multiple records, upsert se duplicado

  // Consultas de tendência
  getServicePriceTrend(tableId, serviceKey, days=90)
    → Array<{ date, price, change_percent }> para gráficos

  // Histórico completo
  getTablePriceHistory(tableId, limit=100, offset=0)
    → Todos os registros com paginação

  // Relatórios
  getDailyChangeReport(tableId, startDate?, endDate?)
    → Agregação diária: serviços_mudados, aumentos, reduções...

  getMostVolatileServices(tableId, limit=20)
    → Rank de serviços com maior variação de preço

  getPriceIncreases(tableId, days=30, limit=20)
    → Top aumentos percentuais

  getPriceDecreases(tableId, days=30, limit=20)
    → Top reduções percentuais

  getPriceChangeStats(tableId, days=30)
    → Estatísticas agregadas: totais, médias, máximos
}
```

#### 1.3 Controller - `RetailerPriceTableController.ts` (atualizado)
Novos endpoints de análise HTTP:

```typescript
// Integração automática com versionamento
upsert() → Agora registra mudanças de preço automaticamente

// Novos endpoints:
getPriceHistory(slug, limit, offset)
  GET /admin/:slug/price-history
  → Lista completa de mudanças

getPriceTrend(slug, serviceKey, days)
  GET /admin/:slug/price-history/:serviceKey
  → Série temporal para gráficos

getPriceStats(slug, days)
  GET /admin/:slug/analytics/stats
  → Estatísticas gerais consolidadas

getDailyReport(slug, startDate?, endDate?)
  GET /admin/:slug/analytics/daily
  → Agregação por dia com gráficos

getVolatileServices(slug, limit)
  GET /admin/:slug/analytics/volatile
  → Ranking de serviços voláteis

getTopIncreases(slug, days, limit)
  GET /admin/:slug/analytics/increases
  → Maiores aumentos percentuais

getTopDecreases(slug, days, limit)
  GET /admin/:slug/analytics/decreases
  → Maiores reduções percentuais
```

#### 1.4 Rotas - `retailerPriceTables.ts` (atualizado)
Novas rotas configuradas:

```typescript
// Rotas de Price History
router.get("/admin/:slug/price-history", requireAuth, requireAdmin, getPriceHistory)
router.get("/admin/:slug/price-history/:serviceKey", requireAuth, requireAdmin, getPriceTrend)

// Rotas de Analytics
router.get("/admin/:slug/analytics/stats", requireAuth, requireAdmin, getPriceStats)
router.get("/admin/:slug/analytics/daily", requireAuth, requireAdmin, getDailyReport)
router.get("/admin/:slug/analytics/volatile", requireAuth, requireAdmin, getVolatileServices)
router.get("/admin/:slug/analytics/increases", requireAuth, requireAdmin, getTopIncreases)
router.get("/admin/:slug/analytics/decreases", requireAuth, requireAdmin, getTopDecreases)
```

### 2. Frontend

#### 2.1 Service - `retailerPriceTablesService.ts` (atualizado)
Métodos cliente para analytics:

```typescript
// Interfaces adicionadas
export interface PriceHistoryRecord { }
export interface PriceTrendPoint { }
export interface PriceChangeStats { }
export interface DailyChangeReport { }
export interface ServicePriceVariance { }

// Métodos implementados
class RetailerPriceTablesService {
  getPriceHistory(slug, limit=100, offset=0)
    → PriceHistoryRecord[]

  getPriceTrend(slug, serviceKey, days=90)
    → PriceTrendPoint[] para gráficos

  getPriceStats(slug, days=30)
    → PriceChangeStats agregado

  getDailyReport(slug, startDate?, endDate?)
    → DailyChangeReport[]

  getVolatileServices(slug, limit=20)
    → ServicePriceVariance[] ordenado

  getTopIncreases(slug, days=30, limit=20)
    → PriceHistoryRecord[] top aumentos

  getTopDecreases(slug, days=30, limit=20)
    → PriceHistoryRecord[] top reduções
}
```

#### 2.2 Componente - `PriceAnalyticsView.tsx` (NOVO)
Interface React para visualização de analytics:

```typescript
interface PriceAnalyticsViewProps {
  slug: string
  title: string
}

Componentes implementados:
1. Summary Cards
   - Mudanças Totais com contagem de serviços
   - Aumentos com % médio (verde)
   - Reduções com % médio (vermelho)
   - Maior aumento e redução

2. Relatório Diário (Gráfico Composto)
   - BarChart: Serviços alterados, aumentos, reduções
   - LineChart sobreposto: % mudança média
   - XAxis com datas rotacionadas
   - Tooltip com formatação

3. Serviços Voláteis (Tabela)
   - Nome do serviço + badge de volatilidade
   - Mudanças: contagem, mín, máx, amplitude, média
   - Ordenado por volatilidade descendente

4. Top Mudanças (2 Colunas)
   - Maiores aumentos (verde)
   - Maiores reduções (vermelho)
   - Service name, before→after, %, data
   - Badge colorido com % exato

Estados:
- Loading: Skeleton loaders
- Error: Card vermelho com mensagem
- Empty: Mensagem "Nenhum dado"

Controles:
- Seletor de período: 7d, 30d, 90d, 365d
- Auto-reload ao mudar período
- Parallel loading de todos os dados
```

## 📊 Migração SQL

**Arquivo**: `/backend/database/migrations/37_retailer_price_history.sql`

### Tabela Principal
```sql
CREATE TABLE retailer_price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  date DATE NOT NULL,
  service_key VARCHAR(255) NOT NULL,         -- Chave normalizada
  service_name VARCHAR(255) NOT NULL,         -- Nome exibível
  old_price DECIMAL(10, 2) NULL,             -- Preço anterior
  new_price DECIMAL(10, 2) NOT NULL,         -- Novo preço
  price_change_percent DECIMAL(5, 2) NULL,   -- Mudança %
  price_change_amount DECIMAL(10, 2) NULL,   -- Mudança valor
  admin_user_id INT NULL,                    -- Quem fez mudança
  change_source VARCHAR(50) NULL,            -- manual_edit, api, import...
  notes VARCHAR(500) NULL,                   -- Notas adicionais
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (table_id) REFERENCES retailer_price_tables(id),
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id),
  UNIQUE KEY unique_price_history (table_id, date, service_key),
  INDEX idx_table_date (table_id, date DESC),
  INDEX idx_service_key (service_key),
  INDEX idx_change_percent (price_change_percent),
  INDEX idx_recorded_at (recorded_at DESC),
  INDEX idx_admin_user (admin_user_id)
);
```

### Vistas Analíticas

1. **v_retailer_price_trends**
   - Série temporal de preços por serviço
   - Calcula ROW_NUMBER e dias desde mudança
   - Permite identificar tendências

2. **v_retailer_price_stats_daily**
   - Agregação por dia
   - Estatísticas de aumentos/reduções
   - Médias de mudança percentual

3. **v_retailer_price_variance**
   - Volatilidade por serviço
   - Min, max, amplitude, desvio padrão
   - Rank de variabilidade

## 🔌 Integração com Versionamento

O sistema é integrado com o PRIO 1 (Versionamento):

1. **Automatic Recording**: Quando tabela é salva via `upsert()`:
   - Backend extrai preços antigos e novos
   - Compara snapshots
   - Registra apenas mudanças (não duplicate)
   - Associa admin_user_id automaticamente

2. **Tracking**: Cada mudança registra:
   - Preço anterior e novo
   - Percentual e valor absoluto
   - Data da mudança e timestamp
   - Admin user que fez mudança
   - Fonte (manual_edit, api...)

3. **Dois Níveis**:
   - **Versioning (PRIO 1)**: Versão completa da tabela
   - **Price History (PRIO 2)**: Serviço por serviço preço

## 📈 Fluxo de Funcionamento

```
Admin edita tabela de preços
  ↓
PUT /admin/:slug com rawText
  ↓
RetailerPriceTableController.upsert()
  ↓
Valida e salva tabela
  ↓
Extrai preços antigos (antes) e novos (depois)
  ↓
RetailerPriceHistoryModel.recordPriceChanges()
  ↓
INSERT INTO retailer_price_history
  ↓
Histórico salvo, vistas atualizadas
  ↓
Frontend carrega analytics via Service
  ↓
PriceAnalyticsView mostra gráficos/tabelas
```

## 🎯 Casos de Uso

1. **Monitoramento de Preços**
   - Ver todas mudanças em período
   - Identificar serviços mais alterados

2. **Análise de Volatilidade**
   - Quais serviços têm preço instável
   - Qual é a amplitude de mudança

3. **Business Intelligence**
   - Tendências de preço ao longo do tempo
   - Comparações por período
   - Identificar anomalias

4. **Auditoria**
   - Quem fez mudança (admin_user_id)
   - Quando foi feita (recorded_at)
   - Por que foi feita (notes)
   - Por qual sistema (change_source)

## 🚀 Como Usar

### Backend - Listar histórico de preços
```bash
GET /api/retailer-price-tables/admin/samsung-devices/price-history?limit=50
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "table_id": 5,
      "date": "2024-12-01",
      "service_key": "samsung_a15_troca_vidro",
      "service_name": "Samsung A15 > Troca de Vidro",
      "old_price": 120.00,
      "new_price": 135.00,
      "price_change_percent": 12.5,
      "price_change_amount": 15.00,
      "admin_user_id": 2,
      "change_source": "manual_edit",
      "recorded_at": "2024-12-01T10:30:00Z"
    }
  ]
}
```

### Backend - Get Analytics stats
```bash
GET /api/retailer-price-tables/admin/samsung-devices/analytics/stats?days=30
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "data": {
    "total_changes": 45,
    "unique_services": 12,
    "total_increases": 30,
    "total_decreases": 15,
    "avg_increase_percent": 8.5,
    "avg_decrease_percent": -5.2,
    "max_increase_percent": 25.0,
    "max_decrease_percent": -15.0,
    "total_increase_value": 450.00,
    "total_decrease_value": 280.00
  }
}
```

### Frontend - Usar serviço
```typescript
import { retailerPriceTablesService } from "@/services/retailerPriceTablesService";

const slug = "samsung-devices";

// Histórico completo
const history = await retailerPriceTablesService.getPriceHistory(slug);

// Tendência de um serviço
const trend = await retailerPriceTablesService.getPriceTrend(
  slug,
  "samsung_a15_troca_vidro",
  90  // últimos 90 dias
);

// Estatísticas gerais
const stats = await retailerPriceTablesService.getPriceStats(slug, 30);

// Serviços mais voláteis
const volatile = await retailerPriceTablesService.getVolatileServices(slug, 20);

// Maiores aumentos
const increases = await retailerPriceTablesService.getTopIncreases(slug, 30, 20);

// Maiores reduções
const decreases = await retailerPriceTablesService.getTopDecreases(slug, 30, 20);
```

### Frontend - Usar componente
```typescript
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";

export function PriceTablePage() {
  return (
    <PriceAnalyticsView
      slug="samsung-devices"
      title="Samsung Devices"
    />
  );
}
```

## 📂 Arquivos Criados/Modificados

### Criados
- ✅ `/backend/src/utils/priceHistoryUtils.ts` (Utilities)
- ✅ `/backend/src/models/RetailerPriceHistoryModel.ts` (Model)
- ✅ `/src/components/admin/PriceAnalyticsView.tsx` (Component)
- ✅ `/backend/database/migrations/37_retailer_price_history.sql` (Migration)

### Modificados
- ✅ `/backend/src/controllers/RetailerPriceTableController.ts` (Imports + upsert + endpoints)
- ✅ `/backend/src/routes/retailerPriceTables.ts` (Novas rotas)
- ✅ `/src/services/retailerPriceTablesService.ts` (Interfaces + métodos)

## ⚠️ Notas de Implementação

1. **Performance**:
   - Índices estratégicos em tabelas de lookup (date, service_key)
   - Vistas SQL pré-computadas (sem aggregation no app)
   - Paginação obrigatória com limit/offset

2. **Segurança**:
   - Todos endpoints requerem `authenticateToken + requireAdmin`
   - Service_key é normalizado (sem injection)
   - Notes limitado a 500 chars

3. **Integridade de Dados**:
   - Unique constraint em (table_id, date, service_key)
   - Foreign keys para referential integrity
   - Cascade delete se tabela for removida

4. **Locale**:
   - Componente usa data-fns com ptBR
   - Formatação de moeda em `formatCurrency()`
   - Timezone respeitado (recorded_at)

## ✅ Checklist de Validação

- [x] Migração SQL criada com todas as vistas
- [x] Model com 8 métodos implementados
- [x] Controller com 7 endpoints novos
- [x] Rotas configuradas
- [x] Service com 7 métodos
- [x] Componente React completo
- [x] Integração com versioning
- [x] Documentação de uso
- [x] Tipagem TypeScript completa

## 🔄 Próxima Fase

**PRIO 3: Relatórios BI**
- Dashboard executivo com KPIs
- Exportação CSV/PDF
- Filtros avançados por data/serviço
- Alertas de mudanças significativas
