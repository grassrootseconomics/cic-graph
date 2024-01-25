ALTER TABLE accounts ADD COLUMN default_voucher TEXT REFERENCES vouchers(voucher_address);
