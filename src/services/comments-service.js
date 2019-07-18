const xss = require("xss");
const swearjar = require("swearjar");

const CommentsService = {
  getById(db, id) {
    return db
      .from("jto_comments AS comment")
      .select(
        "comment.id",
        "comment.body",
        "comment.date_created",
        "comment.date_modified",
        "comment.card_id",
        db.raw(
          `row_to_json(
                    (SELECT tmp FROM (
                        SELECT
                        usr.id,
                        usr.admin,
                        usr.user_name,
                        usr.date_created,
                        usr.date_modified
                    ) tmp)
                ) AS "user"`
        )
      )
      .leftJoin("jto_users AS usr", "comment.user_id", "usr.id")
      .where("comment.id", id)
      .first();
  },
  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into("jto_comments")
      .returning("*")
      .then(([comment]) => {
        // console.log(comment)
        return comment;
      })
      .then((comment) => {
        // console.log(comment["id"])
        return CommentsService.getById(db, comment.id);
      });
  },
  deleteComment(db, id) {
    return db("jto_comments")
      .where({ id })
      .delete();
  },
  updateComment(db, id, newCommentFields) {
    return db("jto_comments")
      .where({ id })
      .update(newCommentFields);
  },
  serializeComment(comment) {
    return {
      id: comment.id,
      body: xss(comment.body),
      card_id: comment.card_id,
      date_created: comment.date_created,
      date_modified: comment.date_modified,
      user: comment.user || {}
    };
  },
  checkAllFields(comment) {
    for (const [key, value] of Object.entries(comment)) {
      if (value == null) {
        return `Missing required '${key}' to create new comment`;
      }
    }
    // if loops through and finds all keys
    return null;
  },
  setId(comment, id) {
    return (comment.user_id = id);
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
  sanitizeComment(str) {
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

module.exports = CommentsService;
