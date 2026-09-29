CREATE TYPE user_role AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
CREATE TYPE equipment_category AS ENUM ('WEAPON', 'VEHICLE', 'AMMUNITION', 'OTHER');


CREATE TABLE bases (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    location    VARCHAR(150),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    equipment_category NOT NULL,
    unit        VARCHAR(20) NOT NULL DEFAULT 'units'   -- units / rounds / etc
);

CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    role           user_role NOT NULL,
    base_id        INT REFERENCES bases(id),          -- NULL for admin
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- commander must have a base
    CONSTRAINT commander_needs_base CHECK (role <> 'BASE_COMMANDER' OR base_id IS NOT NULL)
);


CREATE TABLE purchases (
    id                 SERIAL PRIMARY KEY,
    base_id            INT NOT NULL REFERENCES bases(id),
    equipment_type_id  INT NOT NULL REFERENCES equipment_types(id),
    quantity           INT NOT NULL CHECK (quantity > 0),
    purchase_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks            TEXT,
    created_by         INT NOT NULL REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE transfers (
    id                 SERIAL PRIMARY KEY,
    from_base_id       INT NOT NULL REFERENCES bases(id),
    to_base_id         INT NOT NULL REFERENCES bases(id),
    equipment_type_id  INT NOT NULL REFERENCES equipment_types(id),
    quantity           INT NOT NULL CHECK (quantity > 0),
    transfer_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks            TEXT,
    created_by         INT NOT NULL REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_bases CHECK (from_base_id <> to_base_id)
);


CREATE TABLE assignments (
    id                 SERIAL PRIMARY KEY,
    base_id            INT NOT NULL REFERENCES bases(id),
    equipment_type_id  INT NOT NULL REFERENCES equipment_types(id),
    quantity           INT NOT NULL CHECK (quantity > 0),
    personnel_name     VARCHAR(100) NOT NULL,
    personnel_id       VARCHAR(50),                    -- service number
    assignment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by         INT NOT NULL REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE expenditures (
    id                 SERIAL PRIMARY KEY,
    base_id            INT NOT NULL REFERENCES bases(id),
    equipment_type_id  INT NOT NULL REFERENCES equipment_types(id),
    quantity           INT NOT NULL CHECK (quantity > 0),
    reason             TEXT NOT NULL,
    expenditure_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by         INT NOT NULL REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,      -- CREATE_PURCHASE, CREATE_TRANSFER, LOGIN...
    entity      VARCHAR(50),               -- purchases / transfers...
    entity_id   INT,
    payload     JSONB,                     -- full request data
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_purchases_filter    ON purchases    (base_id, equipment_type_id, purchase_date);
CREATE INDEX idx_transfers_from      ON transfers    (from_base_id, equipment_type_id, transfer_date);
CREATE INDEX idx_transfers_to        ON transfers    (to_base_id, equipment_type_id, transfer_date);
CREATE INDEX idx_assignments_filter  ON assignments  (base_id, equipment_type_id, assignment_date);
CREATE INDEX idx_expenditures_filter ON expenditures (base_id, equipment_type_id, expenditure_date);
CREATE INDEX idx_audit_user_time     ON audit_logs   (user_id, created_at);