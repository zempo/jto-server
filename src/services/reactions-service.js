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
  matchReaction(db, card_id, user_id) {
    return db
      .from('jto_reacts AS reacts')
      .select("reacts.react_heart AS hearts", "reacts.react_share AS shares", "reacts.card_id", "reacts.user_id")
      .where({ "reacts.card_id": card_id, "reacts.user_id": user_id });
  },
  insertReaction(db, newReaction) {
    return db
      .insert(newReaction)
      .into("jto_reacts")
      .returning("*")
      .then(([reaction]) => {
        console.log(reaction);
        return reaction;
      })
      .then((reaction) => {
        console.log(reaction);
        return ReactionsService.getPublicReactions(db, reaction.card_id);
      });
  },
  updateReactions(db, id, newReaction) {
    return db("jto_reacts")
      .where({ id })
      .update(newReaction);
  },
  serializeReactions(cards) {
    return cards.map(this.serializeReactionCount);
  },
  serializeReactionCount(card) {
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
  },
  serializeQueriedReaction(reaction) {
    const cardTree = new Treeize();

    const reactionData = cardTree.grow([reaction]).getData()[0];

    return {
      card_id: reactionData.card_id,
      user_id: reactionData.user_id,
      hearts: reactionData.hearts,
      shares: reactionData.shares
    };
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = ReactionsService;
