const xss = require("xss");
const Treeize = require("treeize");

const ReactionsService = {
  getPublicReactions(db) {
    return db
      .from("jto_cards AS card")
      .select(
        "card.id",
        "card.theme",
        "card.front_message",
        "card.front_image",
        "card.inside_message",
        "card.inside_image",
        "card.date_created",
        "card.user_id",
        "card.public",
        db.raw(`count(nullif(reacts.react_heart, false)) AS number_of_hearts`),
        db.raw(`count(nullif(reacts.react_share, false)) AS number_of_shares`)
      )
      .leftJoin("jto_reacts AS reacts", "reacts.card_id", "card.id")
      .where("card.public", true)
      .groupBy("card.id")
      .orderBy("card.id");
  },
  getCardReactions(db, id) {
    return ReactionsService.getPublicReactions(db)
      .where("card.id", id)
      .first();
  },
  serializeReactions(cards) {
    return cards.map(this.serializeReaction);
  },
  serializeReaction(card) {
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
      user_id: card.user_id,
      public: cardData.public,
      number_of_hearts: Number(cardData.number_of_hearts) || 0,
      number_of_shares: Number(cardData.number_of_shares) || 0
    };
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.full_name AS user:full_name",
  "usr.email AS user:email",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = ReactionsService;
