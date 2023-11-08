CREATE TABLE IF NOT EXISTS gas_gift_status_type (
  value TEXT PRIMARY KEY
);
INSERT INTO gas_gift_status_type (value) VALUES
('APPROVED'),
('REQUESTED'),
('REJECTED'),
('NONE');

ALTER TABLE accounts ADD COLUMN gas_gift_status TEXT REFERENCES gas_gift_status_type(value) DEFAULT 'NONE' NOT NULL;

ALTER TABLE accounts ADD COLUMN gas_approver INT REFERENCES accounts(id);