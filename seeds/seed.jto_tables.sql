BEGIN;

TRUNCATE
  jto_reacts,
  jto_comments,
  jto_cards,
  jto_users
  RESTART IDENTITY CASCADE;

INSERT INTO jto_users (user_name, full_name, email, password)
    VALUES
    ('the_card_czar', 'Sandra Connor', 'sandraconnors@yahoo.com', '$2a$12$MV7OUsNaGakwgJuK.xLOw.SNU3x8p8L41/2QHVGtKNTkmiDVqMuZy'),
    ('greet-expectations', 'Mike Man', 'jenglish@uk.gov', '$2a$12$5IVP3nR2zVB4gxheaXpXx.JhyFkdTBntGff/KerqCnmFYwJ8G6PjS'),
    ('mindy-city', 'Mindy Momo', 'mmomo@gmail.com', '$2a$12$HUASIHyDako.13cXrl7oVOLK6AIw72wDfuC6svvCzA/u4m2xXuT9y');

INSERT INTO jto_cards 
    (theme, front_message, front_image, inside_message, inside_image, user_id, public)
    VALUES 
    (default, 'Happy Mothers Day!', 'https://loremflickr.com/g/500/400/flowers', 'To the best Mom ever!', 'https://loremflickr.com/g/320/240/mom', 1, TRUE),
    ('indie', 'Happy Fathers Day!', '', 'To an amazing dad!', 'https://loremflickr.com/g/320/240/dad', 2, TRUE),
    ('pen', 'Maybe it''s May...', 'https://loremflickr.com/g/400/500/spring', 'I wouldn''t know, though. Here''s to hoping that I guess your birthday correctly!', 'https://loremflickr.com/g/320/240/cake', 1, TRUE),
    ('roboto', 'Celebrate Good Times, Come on!', 'https://loremflickr.com/g/320/240/happy', 'Celebrate good times! buddy, come on! Dadadada, da da da da da-da!', '', 3, TRUE),
    ('cursive-plus', 'You Are Cordially Invited to the Wedding of Mike and Ike', 'https://loremflickr.com/g/500/400/wedding', 'It will be at Hampden South and Oak lane. If you reach the magestic waterfall, you''ve gone too far. Food will be provided! For the Grooms, that is!', 'https://loremflickr.com/g/320/240/ring', 2, default);

INSERT INTO jto_comments
    (body, card_id, user_id)
    VALUES 
    ('Wow! I really love this card! It''s so sweet!', 1, 3),
    ('I miss my mum!', 1, 2),
    ('Awww! So cute!', 2, 3), 
    ('Haha! This made me chuckle!', 3, 2),
    ('Gotta celebrate those good times!', 4, 2);

INSERT INTO jto_reacts
    (card_id, user_id, react_heart, react_share)
    VALUES
    (1, 2, TRUE, default),
    (1, 3, default, default),
    (2, 1, TRUE, TRUE),
    (2, 3, default, default),
    (3, 2, default, TRUE),
    (3, 3, TRUE, TRUE),
    (4, 1, default, default),
    (4, 2, default, TRUE);


COMMIT; 