const xss = require("xss");
const Treeize = require("treeize");

const CardsService = {
  getPublicCards(db) {
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
        "card.public",
        ...userFields,
        db.raw(`count(DISTINCT comments) AS number_of_comments`)
      )
      .leftJoin("jto_comments AS comments", "comments.card_id", "card.id")
      .leftJoin("jto_users AS usr", "card.user_id", "usr.id")
      .where("card.public", true)
      .groupBy("card.id", "usr.id");
  },
  getPublicById(db, id) {
    return CardsService.getPublicCards(db)
      .where("card.id", id)
      .first();
  },
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
      number_of_comments: Number(cardData.number_of_comments) || 0
    };
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = CardsService;
