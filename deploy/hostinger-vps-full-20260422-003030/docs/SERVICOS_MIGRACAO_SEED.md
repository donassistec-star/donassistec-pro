# Serviços dinâmicos: migração e seed

## Estruturas

- **Legado (01_schema + 02_seed):** `model_services` com `model_id` (PK), `reconstruction`, `glass_replacement`, `parts_available`.
- **Nova (13+):** `model_services` com `id`, `model_id`, `service_id`, `price`, `available`; tabela `services` com os tipos (service_reconstruction, service_glass, service_parts, etc.).

O catálogo e o backend suportam as duas: filtro e `modelServices` funcionam com a nova; com a antiga usa-se as colunas booleanas.

---

## Se você tem a estrutura **antiga**

1. Garantir que `services` e os tipos existam:
   ```bash
   mysql -u ... -p ... < backend/database/migrations/13_dynamic_services_schema.sql
   ```
2. Migrar `model_services` e converter os dados:
   ```bash
   mysql -u ... -p ... < backend/database/migrations/15_migrate_model_services_auto.sql
   ```
3. (Opcional) Após a migração, `model_services` já vem preenchida a partir do backup. Se preferir repopular a partir de `phone_models`:
   ```bash
   mysql -u ... -p ... < backend/database/migrations/21_seed_model_services_new.sql
   ```
   Use `INSERT IGNORE` só se a migração 15 tiver deixado a tabela vazia ou quiser completar modelos novos.

---

## Se você tem a estrutura **nova** e `model_services` vazia

Ex.: rodou `15_migrate_model_services_fixed.sql` (DROP + CREATE sem dados).

1. Garantir `services` (ex.: migration 13):
   ```bash
   mysql -u ... -p ... < backend/database/migrations/13_dynamic_services_schema.sql
   ```
2. Popular `model_services` a partir de `phone_models`:
   ```bash
   mysql -u ... -p ... < backend/database/migrations/21_seed_model_services_new.sql
   ```

O `21_seed_model_services_new` associa aos 3 serviços base (service_reconstruction, service_glass, service_parts) espelhando as regras do `02_seed_data` (ex.: certos modelos sem reconstrução ou sem vidro).

---

## Ordem sugerida (instalação nova com estrutura nova)

1. `01_schema.sql` (phone_models, etc.)
2. `02_seed_data.sql` (phone_models e, se existir, model_services antiga)
3. `13_dynamic_services_schema.sql` (services + model_services nova, se não existir)
4. Se a `model_services` antiga tiver sido criada em 1–2: `15_migrate_model_services_auto.sql` (migra e preenche)
5. Se a `model_services` estiver vazia ou quiser recalcular: `21_seed_model_services_new.sql`

---

## Verificar

- Serviços base: `SELECT * FROM services WHERE id IN ('service_reconstruction','service_glass','service_parts');`
- Vínculos: `SELECT model_id, service_id, available FROM model_services LIMIT 20;`
- API: `GET /api/services`, `GET /api/models` (modelos devem vir com `modelServices` quando a estrutura nova estiver em uso).
