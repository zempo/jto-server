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
                res.json(ReactionsService.serializeReactions(cards));
            })
            .catch(next);
    })
    .post((req, res) => { });

// Auth required
// posting a reaction to a particular card with a particular id
reactionsRouter.route("/:cardId").get((req, res, next) => { });

module.exports = reactionsRouter;