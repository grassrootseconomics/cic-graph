ALTER TABLE commodity_listings RENAME TO product_listings;
ALTER TABLE product_listings ADD COLUMN price INT DEFAULT 0;