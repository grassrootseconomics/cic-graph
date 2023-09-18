CREATE TABLE IF NOT EXISTS voucher_type (
  value TEXT PRIMARY KEY
);
INSERT INTO voucher_type (value) VALUES
('DEMURRAGE'),
('GIFTABLE');

ALTER TABLE vouchers
DROP COLUMN supply,
DROP COLUMN demurrage_rate;

ALTER TABLE vouchers
ADD COLUMN voucher_email TEXT,
ADD COLUMN voucher_website TEXT,
ADD COLUMN voucher_uoa TEXT NOT NULL DEFAULT 'KES',
ADD COLUMN voucher_value INT NOT NULL DEFAULT 10,
ADD COLUMN voucher_type TEXT REFERENCES voucher_type(value) NOT NULL DEFAULT 'DEMURRAGE';
