-- Numeração sequencial para pré-pedidos (PRE-0001, PRE-0002, ...)
-- O número acompanha o fluxo até a conclusão do pedido e envio.

ALTER TABLE pre_pedidos ADD COLUMN numero INT NULL;

SET @r = 0;
UPDATE pre_pedidos SET numero = @r := @r + 1 ORDER BY created_at ASC, id ASC;

ALTER TABLE pre_pedidos MODIFY COLUMN numero INT NOT NULL;
ALTER TABLE pre_pedidos ADD UNIQUE INDEX idx_pre_pedidos_numero (numero);
