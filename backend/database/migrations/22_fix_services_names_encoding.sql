-- Corrige nomes da tabela services com encoding incorreto (mojibake)
-- Erros comuns: AtualizaÃ§Ã£o, PeÃ§as, ReconstruÃ§Ã£o, CÃ¢mera, DisponÃveis
-- Execute: mysql -u user -p donassistec_db < 22_fix_services_names_encoding.sql

SET NAMES utf8mb4;

UPDATE services SET name = 'Reconstrução' WHERE id = 'service_reconstruction';
UPDATE services SET name = 'Troca de Vidro' WHERE id = 'service_glass';
UPDATE services SET name = 'Peças Disponíveis' WHERE id = 'service_parts';
UPDATE services SET name = 'Troca de Bateria' WHERE id = 'service_battery';
UPDATE services SET name = 'Troca de Tela' WHERE id = 'service_screen';
UPDATE services SET name = 'Reparo de Câmera' WHERE id = 'service_camera';
UPDATE services SET name = 'Reparo de Carregamento' WHERE id = 'service_charging';
UPDATE services SET name = 'Atualização/Formatação' WHERE id = 'service_software';
