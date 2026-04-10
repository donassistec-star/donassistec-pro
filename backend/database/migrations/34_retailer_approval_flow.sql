USE donassistec_db;

ALTER TABLE retailers
  ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER active,
  ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER approval_status,
  ADD COLUMN approved_by VARCHAR(100) NULL AFTER approved_at;

UPDATE retailers
SET
  approval_status = 'approved',
  approved_at = COALESCE(updated_at, created_at)
WHERE approval_status = 'approved';

ALTER TABLE retailers
  MODIFY COLUMN approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

CREATE INDEX idx_approval_status ON retailers (approval_status);
