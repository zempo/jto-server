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
  postValidator(card) {
    const NO_ERRORS = null;
    const themeRegex = /^\S*\b(cursive|cursive-plus|handwritten-bold|handwritten|indie|kiddo|pen|quill|roboto|sharpie|typed)\b/;
    const spaceRegex = /^\S*$/;

    for (const [key, value] of Object.entries(card)) {
      if (value == null && (key === "theme" || key === "inside_message" || key === "front_message")) {
        return {
          error: `Missing '${key}' in request body. Images are not required.`
        };
      } else if (key === "theme" && (themeRegex.test(value) == false || spaceRegex.test(value) == false)) {
        // console.log(themeRegex.test(theme) == false);
        return {
          error: `Invalid theme supplied.`
        };
      } else if ((key === "front_message" && value.length > 100) || (key === "inside_message" && value.length > 650)) {
        return {
          error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
        };
      } else if (
        (key === "front_image" && value != null && !isWebUri(value)) ||
        (key === "inside_image" && value != null && !isWebUri(value))
      ) {
        return { error: `If used, card images must be valid URL` };
      }
    }

    return NO_ERRORS;
  },
  patchValidator(card) {
    const NO_ERRORS = null;
    const themeRegex = /^\S*\b(cursive|cursive-plus|handwritten-bold|handwritten|indie|kiddo|pen|quill|roboto|sharpie|typed)\b/;
    const spaceRegex = /^\S*$/;
    console.log(card.theme)

    if (card.theme != null && (themeRegex.test(card.theme) == false || spaceRegex.test(card.theme) == false)) {
      return {
        error: `Invalid theme supplied.`
      };
    } else if ((card.front_message != null)) {
      if (card.front_message.length > 100) {
        return {
          error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
        };
      }
    } else if ((card.inside_message != null)) {
      if (card.inside_message.length > 650) {
        return {
          error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
        };
      }
    } else if ((card.front_image != null)) {
      if (!isWebUri(card.front_image)) {
        return { error: `If used, card images must be valid URL` };
      }
    } else if ((card.inside_image != null)) {
      if (!isWebUri(card.inside_image)) {
        return { error: `If used, card images must be valid URL` };
      }
    }
    return NO_ERRORS;
  },
  correctUser(loggedInId, targetId) {
    const NO_ERRORS = null;
    if (loggedInId !== targetId) {
      return {
        error: `User does not match card`
      };
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
  sanitizeCard(str) {
    let customList = process.env.SWEARS.split(" ");
    let okList = process.env.NONSWEARS2.split(" ");
    let sanitizeStr = str;
    let wordsToRmv = [];

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

    let result = customList.filter((swear) => {
      if (comparisonStr.includes(swear) || comparisonStr2.includes(swear) || comparisonStr3.includes(swear)) {
        wordsToRmv.push(swear);
        return true;
      }
    });

    let result2 = okList.filter((nonswear) => {
      if (comparisonStr.includes(nonswear) || comparisonStr2.includes(nonswear) || comparisonStr3.includes(nonswear)) {
        return true;
      }
    });
    for (let key in swearjar._badWords) {
      let falsePositive = result2.find((word) => word === key);
      if (
        ((swearjar._badWords.hasOwnProperty(key) && (comparisonStr.includes(key) || comparisonStr2.includes(key))) ||
          comparisonStr3.includes(key)) &&
        falsePositive == undefined
      ) {
        wordsToRmv.push(key);
      }
    }
    // otherwise don't return sanitized string
    let astrix = "*";
    sanitizedStr = sanitizeStr
      .split(" ")
      .map((word) => (wordsToRmv.includes(word) ? astrix.repeat(word.length) : word))
      .join(" ");
    return sanitizedStr;
  }
};

const userFields = [
  "usr.id AS user:id",
  "usr.user_name AS user:user_name",
  "usr.date_created AS user:date_created",
  "usr.date_modified AS user:date_modified"
];

module.exports = PrivateService;
