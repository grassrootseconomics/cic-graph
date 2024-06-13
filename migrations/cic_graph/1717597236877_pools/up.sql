-- swap pools
CREATE TABLE IF NOT EXISTS swap_pools (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pool_address TEXT NOT NULL UNIQUE CHECK (pool_address <> '' AND char_length(pool_address) <= 42),
  swap_pool_description TEXT NOT NULL CHECK (swap_pool_description <> '' AND char_length(swap_pool_description) <= 256),
  banner_url TEXT
);

-- URL pointers
ALTER TABLE vouchers ADD COLUMN uoa TEXT;
ALTER TABLE vouchers ADD COLUMN icon_url TEXT;
ALTER TABLE vouchers ADD COLUMN banner_url TEXT;

-- tags
CREATE TABLE IF NOT EXISTS tags (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS voucher_tags (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  voucher INT REFERENCES vouchers(id) NOT NULL,
  tag INT REFERENCES tags(id) NOT NULL,
  UNIQUE (voucher, tag)
);

CREATE TABLE IF NOT EXISTS swap_pool_tags (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  swap_pool INT REFERENCES vouchers(id) NOT NULL,
  tag INT REFERENCES tags(id) NOT NULL,
  UNIQUE (swap_pool, tag)
);
