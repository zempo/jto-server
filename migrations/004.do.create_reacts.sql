CREATE TABLE jto_reacts (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES jto_cards(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES jto_users(id) ON DELETE CASCADE NOT NULL,
    react_heart boolean DEFAULT FALSE,
    react_share boolean DEFAULT FALSE
);