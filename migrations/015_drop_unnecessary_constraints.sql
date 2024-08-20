ALTER TABLE personal_information DROP CONSTRAINT personal_information_family_name_check RESTRICT;
ALTER TABLE personal_information DROP CONSTRAINT personal_information_year_of_birth_check RESTRICT;
ALTER TABLE personal_information DROP CONSTRAINT personal_information_given_names_check RESTRICT;
ALTER TABLE personal_information DROP CONSTRAINT personal_information_location_name_check RESTRICT;

ALTER TABLE users DROP CONSTRAINT users_interface_identifier_check RESTRICT;

ALTER TABLE voucher_certifications DROP CONSTRAINT voucher_certifications_certifier_weight_check RESTRICT;
ALTER TABLE voucher_certifications DROP CONSTRAINT voucher_certifications_certificate_url_pointer_check RESTRICT;

ALTER TABLE vouchers DROP CONSTRAINT vouchers_symbol_check RESTRICT;
ALTER TABLE vouchers DROP CONSTRAINT vouchers_voucher_name_check RESTRICT;
ALTER TABLE vouchers DROP CONSTRAINT vouchers_voucher_address_check RESTRICT;
ALTER TABLE vouchers DROP CONSTRAINT vouchers_voucher_address_check1 RESTRICT;
ALTER TABLE vouchers DROP CONSTRAINT vouchers_location_name_check RESTRICT;

ALTER TABLE vpa DROP CONSTRAINT vpa_vpa_check RESTRICT;


