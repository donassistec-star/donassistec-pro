-- Migration para histórico de mudanças nas configurações

CREATE TABLE IF NOT EXISTS settings_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255) NOT NULL,
  changed_by_email VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_settings_history_key (setting_key),
  INDEX idx_settings_history_changed_at (changed_at),
  INDEX idx_settings_history_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
