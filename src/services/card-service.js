const xss = require("xss");
const Treeize = require("treeize");

const CardsService = {
  getSomething(db) {
    return db.from('jto_cards').select('*')
  },
  getPublicCards(db) {
    return db
      .from('jto_cards AS card')
      .select(
        'card.id',
        'card.theme',
        'card.front_message',
        'card.front_image',
        'card.inside_message',
        'card.inside_image',
        'card.date_created',
        'card.public',
        ...userFields,
        db.raw(`count(nullif(reacts.react_heart, false)) AS number_of_hearts`),
        db.raw(`count(nullif(reacts.react_share, false)) AS number_of_shares`),
        db.raw(`count(DISTINCT comments) AS number_of_comments`)
      )
      .leftJoin('jto_reacts AS reacts', 'card.id', 'react.card_id')
      .leftJoin('jto_comments AS comments', 'card.id', 'comments.card_id')
      .leftJoin('jto_users AS usr', 'card.user_id', 'usr.id')
      .where('card.public', true)
      .groupBy('card.id', 'usr.id');
  },
  getPrivateCards(db, id) {
    return db
      .from('jto_cards AS cards')
      .select(
        'card.id',
        'card.theme',
        'card.front_message',
        'card.front_image',
        'card.inside_message',
        'card.inside_image',
        'card.date_created',
        'card.public',
        ...userFields
      )
      .leftJoin('jto_users AS usr', 'card.user_id', 'usr.id')
      .where({
        'usr.id': id,
        'card.public': false
      });
  },
  getPublicById(id) { },
  serializeCards(cards) {
    return cards.map(this.serializeCard);
  },
  serializeCard(card) {
    const cardTree = new Treeize();

    const cardData = cardTree.grow([card]).getData()[0];

    return {
      id: cardData.id,
      theme: cardData.theme,
      front_message: xss(cardData.front_message),
      front_image: xss(cardData.front_image),
      inside_message: xss(cardData.inside_message),
      inside_image: xss(cardData.inside_image),
      date_created: cardData.date_created,
      public: cardData.public,
      user: cardData.user || {},
      number_of_comments: Number(cardData.number_of_comments) || 0,
      number_of_hearts: Number(cardData.number_of_hearts) || 0,
      number_of_shares: Number(cardData.number_of_shares) || 0
    };
  }
};

const userFields = [
  'usr.id AS user:id',
  'usr.user_name AS user:user_name',
  'usr.full_name AS user:full_name',
  'usr.email AS user:email',
  'usr.date_created AS user:date_created',
  'usr.date_modified AS user:date_modified'
];

module.exports = CardsService;
