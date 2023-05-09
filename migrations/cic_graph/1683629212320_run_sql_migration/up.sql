-- #24 fix
ALTER TABLE transactions ALTER COLUMN tx_hash TYPE VARCHAR(66);

-- #20 fix
ALTER TABLE personal_information ADD COLUMN language_code VARCHAR(3);
ALTER TABLE personal_information ALTER COLUMN language_code SET DEFAULT 'eng';

-- #16 fix
ALTER TABLE vouchers ADD COLUMN radius INT;

-- #15 fix
ALTER TABLE voucher_backers RENAME TO voucher_issuers;
