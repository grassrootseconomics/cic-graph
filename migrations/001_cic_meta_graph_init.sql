-- bootstrap enums as reference tables
-- refs:
--   - https://hasura.io/docs/latest/graphql/core/databases/postgres/schema/enums/
--   - http://spec.graphql.org/June2018/#EnumValue

-- account_type enum
CREATE TABLE IF NOT EXISTS account_type (
  value TEXT PRIMARY KEY
);
INSERT INTO account_type (value) VALUES
('CUSTODIAL_PERSONAL'),
('CUSTODIAL_BUSINESS'),
('CUSTODIAL_COMMUNITY'),
('CUSTODIAL_SYSTEM'),
('NON_CUSTODIAL_PERSONAL'),
('NON_CUSTODIAL_BUSINESS'),
('NON_CUSTODIAL_COMMUNITY'),
('NON_CUSTODIAL_SYSTEM');

-- service_type enum
CREATE TABLE IF NOT EXISTS service_type (
  value TEXT PRIMARY KEY
);
INSERT INTO service_type (value) VALUES
('WANT'),
('OFFER');

-- interface_type enum
CREATE TABLE IF NOT EXISTS interface_type (
  value TEXT PRIMARY KEY
);
INSERT INTO interface_type (value) VALUES
('USSD'),
('TELEGRAM'),
('APP');

-- interface_type enum
CREATE TABLE IF NOT EXISTS gender_type (
  value TEXT PRIMARY KEY
);
INSERT INTO gender_type (value) VALUES
('MALE'),
('FEMALE');

-- bootstrap user and voucher core tables/models

-- 'users' contains every registered user 
CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  interface_type TEXT REFERENCES interface_type(value) NOT NULL,
  interface_identifier TEXT UNIQUE NOT NULL CHECK (interface_identifier <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_information (
  user_identifier INT REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  year_of_birth INT,
  location_name TEXT,
  gender TEXT REFERENCES gender_type(value),
  family_name TEXT,
  given_names TEXT
);

-- every user can have multiple accounts
CREATE TABLE IF NOT EXISTS accounts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_identifier INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT REFERENCES account_type(value) NOT NULL,
  blockchain_address TEXT NOT NULL CHECK (blockchain_address <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- every account can have a unique market place
CREATE TABLE IF NOT EXISTS marketplaces (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account INT REFERENCES accounts(id) UNIQUE NOT NULL,
  marketplace_name TEXT NOT NULL CHECK (marketplace_name <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_address TEXT NOT NULL UNIQUE CHECK (token_address <> ''),
  symbol TEXT NOT NULL CHECK (symbol <> ''),
  voucher_name TEXT NOT NULL CHECK (voucher_name <> ''),
  issuer INT REFERENCES accounts(id) NOT NULL,
  voucher_description TEXT NOT NULL CHECK (voucher_description <> ''),
  demurrage_rate NUMERIC NOT NULL CHECK (demurrage_rate > 0),
  sink_address INT REFERENCES accounts(id) NOT NULL,
  supply INT NOT NULL CHECK (supply > 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_endorsements (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id),
  url_pointer TEXT NOT NULL CHECK (url_pointer <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_accepted_payment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id),
  price FLOAT NOT NULL CHECK (price > 0)
);

-- every marketplace can have multiple services offered
CREATE TABLE IF NOT EXISTS services (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  marketplace INT REFERENCES marketplaces(id),
  service_type TEXT REFERENCES service_type(value) NOT NULL CHECK (service_type <> ''),
  service_description TEXT NOT NULL CHECK (service_description <> ''),
  service_available BOOLEAN DEFAULT true,
  service_accepted_payment INT REFERENCES service_accepted_payment(id),
  location_name TEXT NOT NULL CHECK (location_name <> ''),
  geo POINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services_images (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id INT REFERENCES services(id),
  url_pointer TEXT NOT NULL CHECK (url_pointer <> '')
);

CREATE TABLE IF NOT EXISTS services_ratings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id INT REFERENCES services(id),
  rating_by INT REFERENCES accounts(id),
  score INT CHECK (score > 0 AND score <=5),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

---- create above / drop below ----

DROP TABLE IF EXISTS
services_ratings, services_images,services,
service_accepted_payment, endorsements,
vouchers, marketplaces, identifiers,
accounts, personal_information;

DROP TABLE IF EXISTS
interface_type, service_type, account_type;
