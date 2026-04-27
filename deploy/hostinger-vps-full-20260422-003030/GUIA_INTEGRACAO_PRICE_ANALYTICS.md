# Guia de Integração - PriceAnalyticsView

## 📋 Visão Geral

Este guia mostra como integrar o componente `PriceAnalyticsView` em suas páginas admin para visualizar análises de preço.

## 🚀 Passo 1: Verificar Dependências

Verificar se `recharts` está instalado (já está no projeto):

```bash
npm list recharts
# ou
yarn list recharts
# Deve retornar: recharts@^2.15.4
```

Se não estiver, instale:
```bash
npm install recharts
# ou
yarn add recharts
```

## 🔧 Passo 2: Verificar Componentes UI

O componente `PriceAnalyticsView` usa estes componentes Shadcn:
- ✅ Card
- ✅ Badge
- ✅ Button
- ✅ Tabs
- ✅ Skeleton

Todos devem estar disponíveis em `/src/components/ui/`.

## 📁 Passo 3: Verificar Arquivo de Formatação

Criar/verificar função helper de formatação:

**Arquivo**: `/src/utils/formatters.ts`

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
```

## 💻 Passo 4: Integrar em Página Admin

### Exemplo 1: Página de Tabela Única

**Arquivo**: `/src/pages/admin/PriceTableDetail.tsx`

```typescript
import { useParams } from "react-router-dom";
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";
import { retailerPriceTablesService, RetailerPriceTableRecord } from "@/services/retailerPriceTablesService";
import { useState, useEffect } from "react";

export function PriceTableDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [table, setTable] = useState<RetailerPriceTableRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTable();
  }, [slug]);

  const loadTable = async () => {
    try {
      setLoading(true);
      if (slug) {
        const data = await retailerPriceTablesService.getAdmin(slug);
        setTable(data);
      }
    } catch (error) {
      console.error("Erro ao carregar tabela:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!table) return <div>Tabela não encontrada</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{table.title}</h1>
        <p className="text-gray-600">Versão {table.version}</p>
      </div>

      {/* Abas: Edição, Histórico, Analytics */}
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="history">Histórico de Versões</TabsTrigger>
          <TabsTrigger value="analytics">Análise de Preços</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <PriceAnalyticsView slug={slug!} title={table.title} />
        </TabsContent>

        {/* ... outras abas ... */}
      </Tabs>
    </div>
  );
}
```

### Exemplo 2: Dashboard Geral

**Arquivo**: `/src/pages/admin/PriceTablesList.tsx`

```typescript
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";
import { retailerPriceTablesService, RetailerPriceTableRecord } from "@/services/retailerPriceTablesService";
import { useState, useEffect } from "react";

export function PriceTablesList() {
  const [tables, setTables] = useState<RetailerPriceTableRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await retailerPriceTablesService.listAdmin();
      setTables(data);
      if (data.length > 0) {
        setSelectedSlug(data[0].slug);
      }
    } catch (error) {
      console.error("Erro ao carregador tabelas:", error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {/* Lista de tabelas */}
      <div className="space-y-2">
        <h2 className="font-bold">Tabelas de Preço</h2>
        {tables.map((table) => (
          <button
            key={table.slug}
            onClick={() => setSelectedSlug(table.slug)}
            className={`w-full text-left p-3 rounded border ${
              selectedSlug === table.slug
                ? "bg-blue-100 border-blue-500"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            {table.title}
          </button>
        ))}
      </div>

      {/* Analytics */}
      <div className="md:col-span-3">
        {selectedSlug && (
          <PriceAnalyticsView slug={selectedSlug} title={tables.find((t) => t.slug === selectedSlug)?.title || ""} />
        )}
      </div>
    </div>
  );
}
```

### Exemplo 3: Modal/Dialog

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";

interface PriceAnalyticsDialogProps {
  slug: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriceAnalyticsDialog({
  slug,
  title,
  open,
  onOpenChange,
}: PriceAnalyticsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análise de Preços - {title}</DialogTitle>
        </DialogHeader>
        <PriceAnalyticsView slug={slug} title={title} />
      </DialogContent>
    </Dialog>
  );
}

// Usar:
const [analyticsOpen, setAnalyticsOpen] = useState(false);

<PriceAnalyticsDialog
  slug={table.slug}
  title={table.title}
  open={analyticsOpen}
  onOpenChange={setAnalyticsOpen}
/>
```

## 🎯 Passo 5: Testar Componente

### Na Página de Desenvolvimento (Dev Mode)

```bash
npm run dev
```

Navegar para `/admin/price-analytics` e verificar:

1. **Summary Cards carregam**
   - ✅ Números aparecem sem erro
   - ✅ Cores corretas (verde/vermelho)

2. **Gráficos renderizam**
   - ✅ Abas funcionam (Daily/Volatile/TopChanges)
   - ✅ Dados aparecem ou "Nenhum dado"
   - ✅ Eixos X/Y com labels

3. **Seletor de período funciona**
   - ✅ Botões 7d, 30d, 90d, 365d
   - ✅ Dados recarregam ao clicar
   - ✅ Botão ativo tem cor diferente

4. **Responsive**
   - ✅ Desktop: layout completo
   - ✅ Tablet: grid adapta
   - ✅ Mobile: cards empilhados

## 🧪 Passo 6: Testar Endpoints

### Backend - Verificar dados

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Testar endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/retailer-price-tables/admin/samsung-devices/analytics/stats?days=30"
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "total_changes": 45,
    "unique_services": 12,
    ...
  }
}
```

## ⚠️ Troubleshooting

### Problema 1: "Cannot find module 'recharts'"
**Solução**:
```bash
npm install recharts@^2.15.4
npm run dev  # Reinicie
```

### Problema 2: Gráficos não aparecem

Verificar console do browser:
```javascript
// Copie para console
import('recharts').then(r => console.log('recharts loaded:', r))
```

Se erro, remova `node_modules` e reinstale:
```bash
rm -rf node_modules
npm install
npm run dev
```

### Problema 3: Dados não carregam (erro 401/403)

Verificar:
1. Token está ativo?
2. User é admin?
3. Backend rodando?

```typescript
// No componente, adicionar log:
console.log("Requisição para:", `/admin/${slug}/analytics/stats`)
```

### Problema 4: Componente renderiza mas não há dados

Verificar no banco:
```sql
SELECT COUNT(*) FROM retailer_price_history WHERE table_id = YOUR_TABLE_ID;
```

Se zero, editar tabela de preço para gerar registros de mudança.

## 🔗 Rotas Necessárias

Adicionar estas rotas ao router/app (se não estiverem):

```typescript
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";

// Em seu router setup:
{
  path: "/admin/price-analytics/:slug",
  element: <PriceAnalyticsView />,
  requiredAuth: true,
  requiredRole: "admin"
}
```

## 📊 Exemplos de Dados

### Sample Price History Record

```json
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
  "notes": "Ajuste trimestral",
  "recorded_at": "2024-12-01T10:30:00Z"
}
```

### Sample Analytics Stats

```json
{
  "total_changes": 156,
  "unique_services": 28,
  "total_increases": 98,
  "total_decreases": 58,
  "avg_increase_percent": 7.32,
  "avg_decrease_percent": -4.18,
  "max_increase_percent": 25.5,
  "max_decrease_percent": -18.25,
  "total_increase_value": 2345.50,
  "total_decrease_value": 1832.75
}
```

## 🚀 Deploy/Produção

Antes de deploy, verificar:

1. **Migração executada**
   ```bash
   backend> npm run migrate
   # Deve executar migration 37
   ```

2. **Índices criados**
   ```sql
   SHOW INDEX FROM retailer_price_history;
   # Deve ter 7 índices
   ```

3. **Vistas criadas**
   ```sql
   SHOW TABLES LIKE 'v_retailer_price%';
   # Deve retornar 3 vistas
   ```

4. **Teste de carga** (opcional)
   ```bash
   # Dados de teste
   npm run scripts:load-test-data
   ```

5. **Build frontend**
   ```bash
   npm run build
   npm run preview  # Testar build
   ```

## 📝 Notas

- Componente é **responsivo** por padrão
- **Lazy loading**: dados carregam via AJAX
- **Debounce**: período é memorizado
- **Cache**: Recharts cacheando renderizações
- **i18n ready**: Strings em português (ptBR)

## ✅ Checklist Final

- [ ] Recharts instalado e importado
- [ ] Componentes Shadcn UI disponíveis
- [ ] `formatCurrency` helper existe
- [ ] Página/rota criada
- [ ] Token setup correto
- [ ] Backend rodando na porta 8000
- [ ] Dados de teste existem no BD
- [ ] Gráficos renderizando
- [ ] Período selector funciona
- [ ] Responsivo em mobile
- [ ] Sem console errors
- [ ] Pronto para deploy

## 🎓 Próximas Etapas

1. **Customização**: Adicionar mais gráficos (Pie, Scatter)
2. **Exportação**: Botão para download CSV/PDF
3. **Alertas**: Email quando volatilidade > threshold
4. **Comparação**: Período vs período anterior
5. **Forecast**: Predição de tendências (ML)
