const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const reactionsRouter = express.Router();
const ReactionsService = require("../services/reactions-service");

// No auth required
reactionsRouter
    .route("/")
    .get((req, res, next) => {
        ReactionsService.getPublicReactions(req.app.get("db"))
            .then((cards) => {
                res.json(cards);
            })
            .catch(next);
    })
    .post((req, res) => { });

// Auth required
reactionsRouter.route("/:cardId").get((req, res, next) => { });

module.exports = reactionsRouter;