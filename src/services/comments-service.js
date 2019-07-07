const xss = require("xss");

const CommentsService = {
  getById(db, id) {
    return db
      .from("jto_comments AS comment")
      .select(
        "comment.id",
        "comment.body",
        "comment.date_created",
        "comment.card_id",
        db.raw(
          `row_to_json(
                    (SELECT tmp FROM (
                        SELECT
                        usr.id,
                        usr.user_name,
                        usr.full_name,
                        usr.email,
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
      body: comment.body,
      card_id: comment.card_id,
      date_created: comment.date_created,
      user: comment.user || {}
    };
  }
};

module.exports = CommentsService;
