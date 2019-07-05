const express = require('express');
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");
const CommentsService = require('../services/comments-service')
const { requireAuth } = require('../middleware/jwt-auth')

const commentsRouter = express.Router();
const jsonBodyParser = express.json();

// as long as you include the requireAuth middleware, this endpoint request will remain protected!!
// allow for comment deletion functionality
commentsRouter
    .route("/")
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { body, card_id } = req.body

        const newComment = { body, card_id };

        for (const [key, value] of Object.entries(newComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }

        newComment.user_id = req.user.id

        CommentsService.insertComment(req.app.get("db"), newComment)
            .then(comment => {
                console.log(comment)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.id}`))
                    .json(CommentsService.serializeComment(comment))
            })
            .catch(next)
    })

// post new comment --> get comments 
// get comments --> delete comment --> get comments
// get comments --> click comment edit --> get comment --> populate form values --> patch comment --> get comments 

commentsRouter
    .route("/:comment_id")
    .all(requireAuth)
    .all(checkCommentExists)
    .get((req, res) => {
        // to do: add require auth
        // use get req to populate form
        res.json(CommentsService.serializeComment(res.comment))
    })
    .delete((req, res, next) => {
        // make sure to add requireAuth
        // .delete(requireAuth, (req, res, next) => {...})

        CommentsService.deleteComment(req.app.get("db"), req.params.comment_id)
            .then((numberRowsAffected) => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { body, date_created } = req.body
        const commentToUpdate = { body, date_created }

        const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain either the comment body or comment date`
            })
        }

        CommentsService.updateComment(req.app.get("db"), req.params.comment_id, commentToUpdate)
            .then(numberRowsAffected => {
                res.status(204).end()
            })
    })

async function checkCommentExists(req, res, next) {
    try {
        const comment = await CommentsService.getById(req.app.get("db"), req.params.comment_id)

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

module.exports = commentsRouter
