-- Warning: Run with a SQL migration tool like tern because of enum bootsrapping within the schema

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

CREATE TABLE IF NOT EXISTS tx_type (
  value TEXT PRIMARY KEY
);
INSERT INTO tx_type (value) VALUES
('MINT_TO'),
('TRANSFER'),
('TRANSFER_FROM');

-- bootstrap user and voucher core tables/models

-- 'users' contains every registered user 
CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  interface_type TEXT REFERENCES interface_type(value) NOT NULL,
  interface_identifier TEXT UNIQUE NOT NULL CHECK (interface_identifier <> '' AND char_length(interface_identifier) <= 64),
  activated BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_information (
  user_identifier INT REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  year_of_birth INT NULL CHECK (year_of_birth >= 1900 AND year_of_birth < 2100),
  gender TEXT REFERENCES gender_type(value),
  family_name TEXT NULL CHECK (family_name <> '' AND char_length(family_name) <= 64),
  given_names TEXT NULL CHECK (given_names <> '' AND char_length(given_names) <= 64),
  location_name TEXT NULL CHECK (location_name <> '' AND char_length(location_name) <= 64),
  geo POINT
);

-- every user can have multiple accounts
CREATE TABLE IF NOT EXISTS accounts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_identifier INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT REFERENCES account_type(value) NOT NULL,
  blockchain_address TEXT UNIQUE NOT NULL CHECK (blockchain_address <> '' AND char_length(blockchain_address) <= 42),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- every account can have a unique market place
CREATE TABLE IF NOT EXISTS marketplaces (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account INT REFERENCES accounts(id) UNIQUE NOT NULL,
  marketplace_name TEXT NOT NULL CHECK (marketplace_name <> '' AND char_length(marketplace_name) <= 64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- vouchers created on sarafu network
CREATE TABLE IF NOT EXISTS vouchers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher_address TEXT NOT NULL UNIQUE CHECK (voucher_address <> '' AND char_length(voucher_address) <= 42),
  symbol TEXT NOT NULL CHECK (symbol <> '' AND char_length(symbol) <= 8),
  voucher_name TEXT NOT NULL CHECK (voucher_name <> '' AND char_length(voucher_name) <= 64),
  voucher_description TEXT NOT NULL CHECK (voucher_description <> '' AND char_length(voucher_description) <= 256),
  demurrage_rate NUMERIC NOT NULL CHECK (demurrage_rate > 0),
  sink_address TEXT NOT NULL CHECK (voucher_address <> '' AND char_length(voucher_address) <= 42),
  supply INT NOT NULL CHECK (supply > 0),
  active BOOLEAN DEFAULT true,
  location_name TEXT NULL CHECK (location_name <> '' AND char_length(location_name) <= 64),
  geo POINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- voucher issuers is the group of people (1 - n) who back a certain voucher
CREATE TABLE IF NOT EXISTS voucher_backers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id) NOT NULL,
  backer INT REFERENCES accounts(id) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- voucher audit/certifier related info
CREATE TABLE IF NOT EXISTS voucher_certifications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id) NOT NULL,
  certifier INT REFERENCES accounts(id) NOT NULL,
  certifier_weight NUMERIC NOT NULL CHECK (certifier_weight > 0 AND certifier_weight <= 10),
  certificate_url_pointer TEXT NOT NULL CHECK (certificate_url_pointer <> '' AND char_length(certificate_url_pointer) <= 256),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- multiple vouchers can b e used to pay for a service
CREATE TABLE IF NOT EXISTS service_accepted_payment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id) NOT NULL,
  price FLOAT NOT NULL CHECK (price > 0)
);

-- every marketplace can have multiple services offered
CREATE TABLE IF NOT EXISTS services (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  marketplace INT REFERENCES marketplaces(id) NOT NULL,
  service_type TEXT REFERENCES service_type(value) NOT NULL CHECK (service_type <> '' AND char_length(service_type) <= 64),
  service_description TEXT NOT NULL CHECK (service_description <> '' AND char_length(service_description) <= 256),
  service_available BOOLEAN DEFAULT true,
  service_accepted_payment INT REFERENCES service_accepted_payment(id) NOT NULL,
  location_name TEXT NOT NULL CHECK (location_name <> '' AND char_length(location_name) <= 64),
  geo POINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- services/goods offered images if any
CREATE TABLE IF NOT EXISTS services_images (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id INT REFERENCES services(id),
  url_pointer TEXT NOT NULL CHECK (url_pointer <> '' AND char_length(url_pointer) <= 256)
);

-- public service ratings
CREATE TABLE IF NOT EXISTS services_ratings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id INT REFERENCES services(id) NOT NULL,
  rating_by INT REFERENCES accounts(id) NOT NULL,
  score INT CHECK (score > 0 AND score <= 5) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- linked transactional data
CREATE TABLE IF NOT EXISTS transactions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tx_hash VARCHAR(64) NOT NULL UNIQUE,
    block_number INT NOT NULL,
    tx_index INT NOT NULL,
    voucher_address TEXT NOT NULL REFERENCES vouchers(voucher_address) NOT NULL CHECK (voucher_address <> '' AND char_length(voucher_address) <= 42),
    sender_address VARCHAR(42) NOT NULL,
    recipient_address VARCHAR(42) NOT NULL,
    tx_value BIGINT NOT NULL,
    tx_type TEXT REFERENCES tx_type(value),
    date_block TIMESTAMP NOT NULL,
    success BOOLEAN NOT NULL
);

-- virtual payment addresses
CREATE TABLE IF NOT EXISTS vpa (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vpa TEXT NOT NULL UNIQUE CHECK (vpa <> '' AND char_length(vpa) <= 64),
    linked_account INT REFERENCES accounts(id) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- sarafu till number
CREATE TABLE IF NOT EXISTS till (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    till TEXT NOT NULL UNIQUE,
    linked_account INT REFERENCES accounts(id) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
