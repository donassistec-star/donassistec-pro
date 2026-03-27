-- Campo "Preciso até" em pre_pedidos (prazo desejado pelo lojista)
ALTER TABLE pre_pedidos
  ADD COLUMN need_by VARCHAR(100) NULL;
