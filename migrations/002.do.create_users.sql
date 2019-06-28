CREATE TABLE jto_users (
id SERIAL PRIMARY KEY,
user_name TEXT NOT NULL UNIQUE,
full_name TEXT NOT NULL,
password TEXT NOT NULL,
email TEXT,
date_created TIMESTAMP NOT NULL DEFAULT now(),
date_modified TIMESTAMP
);

ALTER TABLE jto_cards ADD COLUMN user_id INTEGER REFERENCES jto_users(id) ON DELETE SET NULL;