# 🎯 Guia de Integração - Versionamento de Tabelas de Preços

## ✅ O que foi Implementado

### Backend (Express/Node.js)
- ✅ **Migrações SQL**:
  - `35_retailer_price_tables_versioning.sql` - Adiciona campos de versão à tabela principal
  - `36_retailer_price_tables_history.sql` - Cria tabela de histórico + trigger automático

- ✅ **RetailerPriceTableModel** (enhanced):
  - `version: number` - campo na tabela principal 
  - `changed_by: number | null` - quem fez a mudança
  - `change_reason: string | null` - motivo da mudança
  - Novos métodos:
    - `findHistory(tableId, limit)` - listar histórico
    - `findHistoryVersion(tableId, version)` - buscar versão específica
    - `rollbackToVersion(slug, version, changedBy, reason)` - reverter
    - `getVersionComparison(tableId, v1, v2)` - comparar versões

- ✅ **RetailerPriceTableController** (4 novos endpoints):
  - `GET /admin/:slug/history` - lista histórico
  - `GET /admin/:slug/history/:version` - busca específica
  - `POST /admin/:slug/rollback/:version` - reverter (com auditoria)
  - `GET /admin/:slug/diff?version1=X&version2=Y` - comparação

- ✅ **Rotas** - Adicionadas 4 novas rotas com autenticação

### Frontend (React/TypeScript)
- ✅ **retailerPriceTablesService** (4 novos métodos):
  - `getHistory(slug, limit)` - carrega histórico
  - `getHistoryVersion(slug, version)` - carrega versão
  - `rollbackToVersion(slug, version, reason)` - faz rollback
  - `compareVersions(slug, v1, v2)` - compara

- ✅ **PriceTableHistoryView** (componente React completo):
  - Visualização de timeline de versões
  - Informações de quando foi alterado
  - Motivo da alteração
  - Botões de rollback
  - Comparação entre versões
  - Expandir/colapsar detalhes

---

## 📋 Como Usar

### 1️⃣ Executar Migrações

```bash
# Conectar ao MySQL
mysql -u root -p seu_database < backend/database/migrations/35_retailer_price_tables_versioning.sql
mysql -u root -p seu_database < backend/database/migrations/36_retailer_price_tables_history.sql
```

Ou usando seu script de migração existente:
```bash
cd backend
npm run migrate  # Ou seu comando equivalente
```

### 2️⃣ Integrar Componente no AdminRetailerPriceTables.tsx

```tsx
import { PriceTableHistoryView } from "@/components/admin/PriceTableHistoryView";

// Em seu componente, após a lista de tabelas:

<Tabs defaultValue="editor" className="w-full">
  <TabsList>
    <TabsTrigger value="editor">Editor</TabsTrigger>
    <TabsTrigger value="history">Histórico</TabsTrigger>
  </TabsList>
  
  <TabsContent value="editor">
    {/* seu conteúdo de editor existente */}
  </TabsContent>
  
  <TabsContent value="history">
    <PriceTableHistoryView 
      slug={selectedSlug}
      currentVersion={selectedTable?.version || 1}
      onRollback={(version) => {
        // Recarregar tabela
        loadTable(selectedSlug);
      }}
    />
  </TabsContent>
</Tabs>
```

### 3️⃣ Atualizar Chamada de Save

No controller ao fazer update via upsert:

```typescript
// ANTES (sem metadata):
const record = await RetailerPriceTableModel.upsert({
  slug,
  title,
  rawText,
  // ...
});

// DEPOIS (com metadata):
const record = await RetailerPriceTableModel.upsert({
  slug,
  title,
  rawText,
  // ...
}, {
  changedBy: req.user?.id,  // ID do admin
  changeReason: req.body.changeReason || "Atualização"
});
```

---

## 🔄 Fluxo de Funcionamento

### Ao Salvar uma Tabela

```
1. Admin edita tabela → PUT /admin/:slug (com dados + metadata)
  ↓
2. Controller.upsert() recebe
  ↓
3. Model.upsert() faz INSERT ON DUPLICATE UPDATE
  ↓
4. Versão incremente automaticamente: version = version + 1
  ↓
5. Trigger SQL cria entrada em retailer_price_tables_history
  ↓
6. Snapshot completo salvo: raw_text, parsed_data, visibility, etc
```

### Ao Reverter

```
1. Admin clica "Reverter para v3" → POST /admin/:slug/rollback/3
  ↓
2. Controller busca versão 3 do histórico
  ↓
3. Model.rollbackToVersion() reativa dados da v3
  ↓
4. Novo upsert com changeReason = "Revertido para versão 3"
  ↓
5. Versão muda de (ex: 10) para 11 (não volta para 3!)
  ↓
6. Novo histórico criado com motivo da reversão
```

---

## 🔐 Dados Capturados no Histórico

Cada versão armazena:
- ✅ **Texto bruto** (raw_text) - para análise de mudanças
- ✅ **Estrutura parseada** (parsed_data) - categorias, preços, marcas
- ✅ **Templates** (service_templates) - reutilização
- ✅ **Visibilidade** - para/não para revendedores
- ✅ **Destaque** - se é tabela principal
- ✅ **Data efetiva** - quando começa a valer
- ✅ **Auditoria** - quem alterou, quando, por quê

---

## 📊 Consultas SQL Úteis

### Ver histórico de uma tabela
```sql
SELECT version, title, change_reason, created_at 
FROM retailer_price_tables_history 
WHERE table_id = 5 
ORDER BY version DESC;
```

### Ver quem mudou o quê
```sql
SELECT 
  h.version, 
  h.title, 
  h.change_reason,
  h.created_at,
  u.email as changed_by_email
FROM retailer_price_tables_history h
LEFT JOIN admin_users u ON h.changed_by = u.id
WHERE h.table_id = 5
ORDER BY h.version DESC;
```

### Encontrar mudanças de preço
```sql
SELECT 
  v1.version as v_from,
  v2.version as v_to,
  v1.title,
  v1.created_at as changed_at
FROM retailer_price_tables_history v1
JOIN retailer_price_tables_history v2 
  ON v1.table_id = v2.table_id 
  AND v1.version = v2.version - 1
WHERE v1.table_id = 5
  AND v1.raw_text != v2.raw_text
ORDER BY v1.version DESC;
```

---

## 🚀 Próximas Evoluções Possíveis

### 1. Notificações de Mudança
```typescript
// Alertar revendedores quando tabela mudar
POST /notify-retailers/:table_id
- Enviar email: "Tabela X foi atualizada v5 → v6"
- Badge na UI: "Nova versão disponível"
```

### 2. Histórico de Preços (PRIO 2)
```sql
-- Rastrear preço de cada serviço por data
CREATE TABLE retailer_price_history (...)
-- Gerar gráficos de tendência
```

### 3. Aprovação de Mudanças
```typescript
// Fluxo: Draft → Proposto → Aprovado → Publicado
- Salvar como DRAFT (não incrementa versão)
- Propor mudança (incremente version_draft)
- Quebra-galho aprova (move draft para production)
```

### 4. Merge de Changess
```typescript
// Se 2 admins editam simultaneamente
- Detectar conflito
- Mostrar diff a ambos
- Permitir merge manual
```

---

## ✨ Casos de Uso

### 1. Admin Descobre Erro
```
1. Salva tabela com preços errados (v10)
2. Revendedores reclamam
3. Admin acessa histórico → v9 estava correto
4. Clica "Reverter para v9"
5. Dados restaurados, nova versão criada v11
6. Audit trail mostra: v10 → v11 "Revertido por erro de entrada"
```

### 2. Gerente Quer Comparar Semanas
```
1. Segunda-feira: tabela v5 salva
2. Sexta-feira: tabela v12 salva
3. Gerente clica "Comparar v5 vs v12"
4. Vê exatamente quais preços mudaram
5. Exporta relatório para análise
```

### 3. Revendedor Questiona Preço Antigo
```
1. Revendedor: "Mês passado era mais barato!"
2. Admin acessa histórico completo
3. Mostra: v7 (há 30 dias) tinha preço X
4. Hoje v15 tem preço Y
5. Justifica com change_reason de cada versão
```

---

## 📝 Notas Importantes

### ⚠️ Trigger Automático
O trigger SQL em `36_retailer_price_tables_history.sql` automaticamente:
- Cria snapshot ANTES de qualquer UPDATE
- Só dispara se dados realmente mudaram
- Preserva dados antigos mesmo após DELETE

### ⚠️ Versão Incremental
- Versão NUNCA decresce
- Rollback cria NOVA versão (não volta para antigo número)
- Exemplo: v1 → v2 → v3 → v4(rollback de v2) 
  - v4 contém dados de v2, mas é uma versão nova

### ⚠️ Performance
- Histórico pode ficar grande (1000+ tabelas × 100 versões = 100k registros)
- Considerar Archive após 1 ano
- Índice em (table_id, version) já criado

---

## ✅ Checklist de Implementação

- [ ] Rodar migrações SQL 35 e 36
- [ ] Testar Model methods (findHistory, rollbackToVersion)
- [ ] Testar Endpoints com Postman
- [ ] Importar PriceTableHistoryView no Admin
- [ ] Adicionar Tab/Modal para histórico
- [ ] Testar UI:
  - [ ] Carregar histórico
  - [ ] Expandir versões
  - [ ] Comparar versões
  - [ ] Reverter para versão anterior
- [ ] Testar rollback (deve incrementar versão)
- [ ] Verificar audit trail (changed_by, change_reason)
- [ ] Performance com 50 versões
- [ ] Documentar para time

---

## 🎓 Exemplo de Integração Completa

```tsx
// AdminRetailerPriceTables.tsx

import { PriceTableHistoryView } from "@/components/admin/PriceTableHistoryView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRetailerPriceTables() {
  const [selectedTable, setSelectedTable] = useState<RetailerPriceTableRecord | null>(null);
  
  async function handleSave(data) {
    try {
      const result = await retailerPriceTablesService.save(
        selectedTable.slug,
        data
      );
      
      // Atualizar seleção com nova versão
      setSelectedTable(result);
      toast.success("Tabela salva com sucesso!");
      
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  }

  if (!selectedTable) {
    return <div>Selecione uma tabela...</div>;
  }

  return (
    <AdminLayout>
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="history">
            📋 Versões (v{selectedTable.version})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          {/* seu editor existente */}
          <EditorComponent 
            table={selectedTable}
            onSave={handleSave}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <PriceTableHistoryView 
            slug={selectedTable.slug}
            currentVersion={selectedTable.version}
            onRollback={() => {
              // Recarregar tabela para mostrar nova versão
              loadTable(selectedTable.slug);
            }}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `tail -f logs/retailer-price-tables.log`
2. Consultar histórico: `SELECT * FROM retailer_price_tables_history LIMIT 10;`
3. Testar endpoints manualmente com Postman/cURL
