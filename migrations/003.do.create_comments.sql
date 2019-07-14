CREATE TABLE jto_comments (
    id SERIAL PRIMARY KEY,
    body VARCHAR(250) NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL, 
    date_modified TIMESTAMP,
    card_id INTEGER REFERENCES jto_cards(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES jto_users(id) ON DELETE CASCADE NOT NULL
); 