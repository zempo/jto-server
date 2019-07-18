const express = require("express");
const path = require("path");
const swearjar = require("swearjar");
const CommentsService = require("../services/comments-service");
const { requireAuth } = require("../middleware/jwt-auth");

const commentsRouter = express.Router();
const jsonBodyParser = express.json();

// as long as you include the requireAuth middleware, this endpoint request will remain protected!!
// allow for comment deletion functionality
commentsRouter.route("/").post(requireAuth, jsonBodyParser, (req, res, next) => {
  const { body, card_id } = req.body;
  let newComment = { body, card_id };

  newComment.user_id = req.user.id;

  async function validateComment(comment, service) {
    try {
      let missingKeys = await service.checkAllFields(comment);
      if (missingKeys) return res.status(400).json({ error: missingKeys });

      let filteredComment = await service.sanitizeComment(comment.body);
      if (filteredComment) {
        comment.body = filteredComment;
      }

      let insertedComment = await service.insertComment(req.app.get("db"), comment);
      if (!insertedComment) return res.status(409).json({ error: "request timeout" });

      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${insertedComment.id}`))
        .json(service.serializeComment(insertedComment));
    } catch (error) {
      next(error);
    }
  }

  const result = validateComment(newComment, CommentsService);
  result;
});

// post new comment --> get comments
// get comments --> delete comment --> get comments
// get comments --> click comment edit --> get comment --> populate form values --> patch comment --> get comments

// add a user to comment verification middleware
commentsRouter
  .route("/:comment_id")
  .all(requireAuth)
  .all(checkCommentExists)
  .get((req, res) => {
    // if you're an admin or the user, you can access a comment dialogue box (which has edit/delete)
    if (req.user.id === res.comment.user.id || req.user.admin) {
      res.json(CommentsService.serializeComment(res.comment));
    } else {
      res.status(403).end();
    }
  })
  .delete((req, res, next) => {
    if (req.user.id === res.comment.user.id || req.user.admin) {
      // res.json(CommentsService.serializeComment(res.comment))
      CommentsService.deleteComment(req.app.get("db"), req.params.comment_id)
        .then((numberRowsAffected) => {
          res.status(204).end();
        })
        .catch(next);
    } else {
      res.status(403).end();
    }
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { body } = req.body;
    const commentToUpdate = { body };

    commentToUpdate.date_modified = new Date().toLocaleString();

    // console.log(CommentsService.correctUser(req.user.id, res.comment.user.id));
    async function correctPatch(comment, service) {
      try {
        let missingKeys = await service.checkAllFields(comment);
        if (missingKeys) return res.status(400).json({ error: missingKeys });

        const wrongUser = await service.correctUser(req.user.id, res.comment.user.id);
        if (wrongUser && !req.user.admin) return res.status(403).json(wrongUser);

        const sanitizeComment = await service.sanitizeComment(comment.body);
        if (sanitizeComment) {
          comment.body = sanitizeComment;
        }

        const updatedComment = await service.updateComment(req.app.get("db"), req.params.comment_id, comment);
        if (!updatedComment) {
          return res.status(409).json({ error: "request timeout" });
        }

        return res.status(204).end();
      } catch (error) {
        next(error);
      }
    }

    const result = correctPatch(commentToUpdate, CommentsService);
    result;
  });

async function checkCommentExists(req, res, next) {
  try {
    const comment = await CommentsService.getById(req.app.get("db"), req.params.comment_id);

    if (!comment)
      return res.status(404).json({
        error: `This comment no longer exists.`
      });

    res.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = commentsRouter;
