-- bootstrap enums as reference tables
-- refs:
--   - https://hasura.io/docs/latest/graphql/core/databases/postgres/schema/enums/
--   - http://spec.graphql.org/June2018/#EnumValue

-- account_type enum
CREATE TABLE IF NOT EXISTS account_type (
  value TEXT PRIMARY KEY
);
INSERT INTO account_type (value) VALUES
('PERSONAL'),
('BUSINESS');

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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS personal_information (
  user_identifier INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  date_of_birth INT,
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
    blockchain_address TEXT NOT NULL
);

-- every account has a unique interface identifier
CREATE TABLE IF NOT EXISTS identifiers (
  account INT REFERENCES accounts(id) UNIQUE,
  interface_type TEXT REFERENCES interface_type(value) NOT NULL,
  interface_identifier TEXT NOT NULL
);

-- every account can have a unique market place
CREATE TABLE IF NOT EXISTS marketplaces (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account INT REFERENCES accounts(id) UNIQUE,
  marketplace_name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  created_by INT REFERENCES accounts(id),
  blockchain_address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS endorsements (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id),
  url_pointer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_accepted_payment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id),
  price FLOAT NOT NULL
);

-- every marketplace can have multiple services offered
CREATE TABLE IF NOT EXISTS services (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  marketplace INT REFERENCES marketplaces(id),
  service_type TEXT REFERENCES service_type(value) NOT NULL,
  service_description TEXT NOT NULL,
  service_available BOOLEAN DEFAULT true,
  service_accepted_payment INT REFERENCES service_accepted_payment(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS services_location (
  location_name TEXT NOT NULL,
  service INT REFERENCES services(id),
  lat TEXT,
  long TEXT
);

CREATE TABLE IF NOT EXISTS services_images (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service INT REFERENCES services(id),
  url_pointer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services_ratings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service INT REFERENCES services(id),
  rating_by INT REFERENCES accounts(id),
  score INT CHECK (score > 0 AND score <=5)
);

---- create above / drop below ----

DROP TABLE IF EXISTS
services_ratings, services_images, services_location,
services, service_accepted_payment, endorsements,
vouchers, marketplaces, identifiers,
accounts, personal_information, users;

DROP TABLE IF EXISTS
interface_type, service_type, account_type;
