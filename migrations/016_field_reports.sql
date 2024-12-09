
INSERT INTO field_report_status_type (value) VALUES
('DRAFT'),
('SUBMITTED'),
('APPROVED'),
('REJECTED');

CREATE TABLE IF NOT EXISTS field_reports (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL, 
    report TEXT NOT NULL, 
    "description" TEXT NOT NULL,
    vouchers TEXT[] NOT NULL,
    image_url TEXT,
    tags TEXT[],
    location TEXT,
    period_from TIMESTAMP,
    period_to TIMESTAMP,
    created_by INT REFERENCES users(id) NOT NULL,
    modified_by INT REFERENCES users(id) NOT NULL,
    verified_by INT[],
    "status" TEXT REFERENCES field_report_status_type(value) DEFAULT 'DRAFT' NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

