CREATE TYPE theme AS ENUM (
  'cursive',
  'cursive-plus',
  'handwritten',
  'handwritten-bold',
  'indie',
  'kiddo',
  'pen',
  'sharpie',
  'roboto',
  'typed',
  'quill'
);

CREATE TABLE jto_cards (
id SERIAL PRIMARY KEY,
theme theme DEFAULT 'handwritten',
front_message VARCHAR(100) NOT NULL,
front_image TEXT,
inside_message VARCHAR(650) NOT NULL,
inside_image TEXT,
date_created TIMESTAMP DEFAULT now() NOT NULL,
date_modified TIMESTAMP,
public boolean DEFAULT FALSE
);