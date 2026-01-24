-- Seed model_services (estrutura NEW: id, model_id, service_id, price, available)
-- Pré-requisitos: services (com service_reconstruction, service_glass, service_parts) e phone_models populados.
-- Execute após 13_dynamic_services_schema e 15_migrate_model_services_* (ou quando model_services tiver coluna service_id).

-- Reconstrução: todos exceto galaxy-z-fold-5, galaxy-z-flip-5, moto-razr-40, lg-velvet, lg-k62
INSERT IGNORE INTO model_services (id, model_id, service_id, price, available)
SELECT
  CONCAT('ms_', pm.id, '_service_reconstruction'),
  pm.id,
  'service_reconstruction',
  0.00,
  TRUE
FROM phone_models pm
WHERE pm.id NOT IN ('galaxy-z-fold-5', 'galaxy-z-flip-5', 'moto-razr-40', 'lg-velvet', 'lg-k62');

-- Troca de vidro: todos exceto galaxy-z-fold-5, galaxy-z-flip-5, moto-razr-40
INSERT IGNORE INTO model_services (id, model_id, service_id, price, available)
SELECT
  CONCAT('ms_', pm.id, '_service_glass'),
  pm.id,
  'service_glass',
  0.00,
  TRUE
FROM phone_models pm
WHERE pm.id NOT IN ('galaxy-z-fold-5', 'galaxy-z-flip-5', 'moto-razr-40');

-- Peças: todos os modelos
INSERT IGNORE INTO model_services (id, model_id, service_id, price, available)
SELECT
  CONCAT('ms_', pm.id, '_service_parts'),
  pm.id,
  'service_parts',
  0.00,
  TRUE
FROM phone_models pm;
