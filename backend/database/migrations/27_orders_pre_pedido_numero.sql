-- Vínculo pré-pedido → pedido e numeração sequencial do pedido (PED-0001, PED-0002, ...)
-- A numeração do pré-pedido (PRE-0001) dá sequência até a conclusão e envio do pedido (PED-0001).

ALTER TABLE orders ADD COLUMN pre_pedido_id VARCHAR(36) NULL;
ALTER TABLE orders ADD COLUMN numero INT NULL;

SET @r = 0;
UPDATE orders SET numero = @r := @r + 1 ORDER BY created_at ASC, id ASC;

ALTER TABLE orders MODIFY COLUMN numero INT NOT NULL;
ALTER TABLE orders ADD UNIQUE INDEX idx_orders_numero (numero);
ALTER TABLE orders ADD INDEX idx_orders_pre_pedido_id (pre_pedido_id);
