const xss = require("xss");
const Treeize = require("treeize");
const { isWebUri } = require("valid-url");
const swearjar = require("swearjar");

const PrivateService = {
  getPrivateCards(db, user_id) {
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
        "card.date_modified",
        "card.public",
        ...userFields
      )
      .leftJoin("jto_users AS usr", "card.user_id", "usr.id")
      .where({
        "usr.id": user_id,
        "card.public": false
      })
      .groupBy("card.id", "usr.id");
  },
  getPrivateById(db, user_id, card_id) {
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
        "card.date_modified",
        "card.public",
        ...userFields
      )
      .leftJoin("jto_users AS usr", "card.user_id", "usr.id")
      .where({
        "card.id": card_id,
        "usr.id": user_id,
        "card.public": false
      })
      .groupBy("card.id", "usr.id");
  },
  insertCard(db, newCard) {
    return db
      .insert(newCard)
      .into("jto_cards")
      .returning("*")
      .then(([card]) => {
        // console.log(card);
        return card;
      })
      .then((card) => {
        // console.log(card);
        return PrivateService.getPrivateById(db, card.user_id, card.id);
      });
  },
  deleteCard(db, id) {
    return db("jto_cards")
      .where({ id })
      .delete();
  },
  updateCard(db, id, newCardFields) {
    return db("jto_cards")
      .where({ id })
      .update(newCardFields);
  },
  postValidator({ theme, front_message, front_image, inside_message, inside_image }) {
    const NO_ERRORS = null;
    const themeRegex = /^\S*\b(cursive|cursive-plus|handwritten-bold|handwritten|indie|kiddo|pen|quill|roboto|sharpie|typed)\b/;
    const spaceRegex = /^\S*$/;

    for (const [key, value] of Object.entries({ theme, front_message, front_image, inside_message, inside_image })) {
      if ((key === theme || key === front_message || key === inside_message) && value == null) {
        return {
          error: `Missing '${key}' in request body. Images are not required.`
        };
      } else if (theme && (themeRegex.test(theme) == false || spaceRegex.test(theme) == false)) {
        // console.log(themeRegex.test(theme) == false);
        return {
          error: `Invalid theme supplied.`
        };
      } else if (front_message && PrivateService.sanitizeCard(front_message)) {
        return {
          error: "Card cannot contain profanity and/or text that violates community guidelines."
        };
      } else if (inside_message && PrivateService.sanitizeCard(inside_message)) {
        return {
          error: "Card cannot contain profanity and/or text that violates community guidelines."
        };
      } else if ((front_message && front_message.length > 100) || (inside_message && inside_message.length > 650)) {
        return {
          error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
        };
      }
    }

    return NO_ERRORS;
  },
  patchValidator({ theme, front_message, front_image, inside_message, inside_image }) {
    const NO_ERRORS = null;
    const themeRegex = /^\S*\b(cursive|cursive-plus|handwritten-bold|handwritten|indie|kiddo|pen|quill|roboto|sharpie|typed)\b/;
    const spaceRegex = /^\S*$/;
    const numberOfValues = Object.values({ theme, front_message, front_image, inside_message, inside_image }).filter(
      Boolean
    ).length;
    if (numberOfValues === 0) {
      return {
        error: `At least one value must be updated. Updatable values: theme, front_message, front_image, inside_message, inside_image`
      };
    } else if (theme && (themeRegex.test(theme) == false || spaceRegex.test(theme) == false)) {
      // console.log(themeRegex.test(theme) == false);
      return {
        error: `Invalid theme supplied.`
      };
    } else if (front_message && PrivateService.sanitizeCard(front_message)) {
      return {
        error: "Card cannot contain profanity and/or text that violates community guidelines."
      };
    } else if (inside_message && PrivateService.sanitizeCard(inside_message)) {
      return {
        error: "Card cannot contain profanity and/or text that violates community guidelines."
      };
    } else if ((front_message && front_message.length > 100) || (inside_message && inside_message.length > 650)) {
      return {
        error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
      };
    } else if ((front_image && !isWebUri(front_image)) || (inside_image && !isWebUri(inside_image))) {
      return { error: `Card images must be valid URL` };
    }

    return NO_ERRORS;
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
      date_modified: cardData.date_modified || null,
      public: cardData.public,
      user: cardData.user || {}
    };
  },
  compareFilters(whiteList1, blackList1, blackList2, str, str2) {
    let diff = whiteList1.filter((x) => !blackList1.includes(x));

    let strNew = str
      .split(" ")
      .map((word) => (diff.includes(word) ? "" : word))
      .join(" ");

    let strNew2 = str2
      .split(" ")
      .map((word) => (diff.includes(word) ? "" : word))
      .join(" ");

    let revised = blackList1.filter((swear) => {
      if (strNew.includes(swear) || strNew2.includes(swear)) {
        return true;
      }
    });

    if (revised.length > 0) {
      return true;
    }
    if (blackList2.length > 0) {
      return true;
    }

    return false;
  },
  sanitizeCard(str) {
    let customList = process.env.SWEARS.split(" ");
    let okList = process.env.NONSWEARS1.split(" ");
    let sanitizeStr = str;
    let swearjarSwears = Object.keys(swearjar._badWords);

    // Process string
    let comparisonStr = sanitizeStr
      .toLowerCase()
      .replace(/\s/g, "")
      .replace(/[.'-_~\%\^\&*\)\(+=]/g, "")
      .replace(/[0]/g, "o")
      .replace(/[1]/g, "l")
      .replace(/[!]/g, "l")
      .replace(/[2]/g, "t")
      .replace(/[3]/g, "e")
      .replace(/[4]/g, "f")
      .replace(/[5]/g, "s")
      .replace(/[6]/g, "b")
      .replace(/[7]/g, "t")
      .replace(/[8]/g, "b")
      .replace(/[$]/g, "s")
      .replace(/[@]/g, "a");

    let comparisonStr2 = sanitizeStr
      .toLowerCase()
      .replace(/\s/g, "")
      .replace(/[.'-_~\%\^\&*\)\(+=]/g, "")
      .replace(/[0]/g, "o")
      .replace(/[1]/g, "i")
      .replace(/[!]/g, "i")
      .replace(/[2]/g, "t")
      .replace(/[3]/g, "e")
      .replace(/[4]/g, "h")
      .replace(/[5]/g, "s")
      .replace(/[6]/g, "b")
      .replace(/[7]/g, "t")
      .replace(/[8]/g, "b")
      .replace(/[$]/g, "s")
      .replace(/[@]/g, "a");

    let comparisonStr3 = sanitizeStr
      .toLowerCase()
      .replace(/[\^]/g, "a")
      .replace(/[\&]/g, "d");

    let comparisonStr4 = sanitizeStr
      .toLowerCase()
      .replace(/[.',-_~\%\^\&*\)\(+=]/g, "")
      .replace(/[0]/g, "o")
      .replace(/[1]/g, "l")
      .replace(/[!]/g, "l")
      .replace(/[2]/g, "t")
      .replace(/[3]/g, "e")
      .replace(/[4]/g, "f")
      .replace(/[5]/g, "s")
      .replace(/[6]/g, "b")
      .replace(/[7]/g, "t")
      .replace(/[8]/g, "b")
      .replace(/[$]/g, "s")
      .replace(/[@]/g, "a");

    let comparisonStr5 = sanitizeStr
      .toLowerCase()
      .replace(/[.',-_~\%\^\&*\)\(+=]/g, "")
      .replace(/[0]/g, "o")
      .replace(/[1]/g, "i")
      .replace(/[!]/g, "i")
      .replace(/[2]/g, "t")
      .replace(/[3]/g, "e")
      .replace(/[4]/g, "h")
      .replace(/[5]/g, "s")
      .replace(/[6]/g, "b")
      .replace(/[7]/g, "t")
      .replace(/[8]/g, "b")
      .replace(/[$]/g, "s")
      .replace(/[@]/g, "a");

    let blackList1 = swearjarSwears.filter((swear) => {
      if (comparisonStr.includes(swear) || comparisonStr2.includes(swear) || comparisonStr3.includes(swear)) {
        return true;
      }
    });
    let blackList2 = customList.filter((swear) => {
      if (comparisonStr.includes(swear) || comparisonStr2.includes(swear) || comparisonStr3.includes(swear)) {
        return true;
      }
    });

    let whiteList1 = okList.filter((nonswear) => {
      if (comparisonStr.includes(nonswear) || comparisonStr2.includes(nonswear) || comparisonStr3.includes(nonswear)) {
        return true;
      }
    });

    return PrivateService.compareFilters(whiteList1, blackList1, blackList2, comparisonStr4, comparisonStr5);
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = PrivateService;
