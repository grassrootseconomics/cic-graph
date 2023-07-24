CREATE TABLE IF NOT EXISTS account_role_type (
  value TEXT PRIMARY KEY
);
INSERT INTO account_role_type (value) VALUES
('USER'),
('STAFF'),
('ADMIN');

ALTER TABLE accounts ADD COLUMN account_role TEXT REFERENCES account_role_type(value) DEFAULT 'USER' NOT NULL;
