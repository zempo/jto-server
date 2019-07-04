const xss = require("xss");
const Treeize = require("treeize");

const PrivateService = {
  getPrivateCards(db, id) {
    // if the user passes authentication, then their id will be used to display their cards
    // cards can only be public or private
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
      )
      .leftJoin("jto_users AS usr", "card.user_id", "usr.id")
      .where({
        "usr.id": id,
        "card.public": false
      })
      .groupBy("card.id", "usr.id");
  },
  privateToPublic(db, user_id, card_id) {
    console.log('hello');
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
      user: cardData.user || {}
    };
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.full_name AS user:full_name",
  "usr.email AS user:email",
  "usr.password AS user:password",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = PrivateService;
