CREATE TABLE IF NOT EXISTS commodity_type (
  value TEXT PRIMARY KEY
);
INSERT INTO commodity_type (value) VALUES
('SERVICE'),
('GOOD');

CREATE TABLE IF NOT EXISTS commodity_listings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id) NOT NULL,
  account INT REFERENCES accounts(id) NOT NULL,
  commodity_name TEXT NOT NULL,
  quantity INT NOT NULL,
  frequency TEXT NOT NULL,
  commodity_type TEXT REFERENCES commodity_type(value) NOT NULL,
  commodity_description TEXT NOT NULL,
  commodity_available BOOLEAN DEFAULT true,
  location_name TEXT NOT NULL,
  geo POINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
