const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const { requireAuth } = require("../middleware/jwt-auth");
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
  .post((req, res) => {});

// Auth required
// posting a reaction to a particular card with a particular id
reactionsRouter
  .route("/:card_id")
  .all(checkCardExists)
  .get((req, res) => {
    res.json(ReactionsService.serializeReaction(res.card));
  });

reactionsRouter
  .route("/hearts/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .all(checkUserReacted)
  .get((req, res, next) => {
    console.log("hello");
  })
  .patch((req, res, next) => {});

reactionsRouter
  .route("/shares/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .all(checkUserReacted)
  .patch((req, res, next) => {});

async function checkUserReacted(req, res, next) {
  try {
    const reaction = await ReactionsService.matchReaction(req.app.get("db"), req.params.card_id, res.user.id);

    console.log(reaction);
  } catch (error) {
    next(error);
  }
}

/* async/await syntax for promises */
async function checkCardExists(req, res, next) {
  try {
    const card = await ReactionsService.getCardReactions(req.app.get("db"), req.params.card_id);

    if (!card)
      return res.status(404).json({
        error: `This public card no longer exists. It might have been deleted or made private.`
      });

    res.card = card;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = reactionsRouter;
