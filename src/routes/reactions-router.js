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
  .post((req, res) => { });

// Auth required
// posting a reaction to a particular card with a particular id
reactionsRouter
  .route("/:card_id")
  .all(checkCardExists)
  .get((req, res) => {
    res.json(ReactionsService.serializeReactionCount(res.card));
  });

reactionsRouter
  .route("/hearts/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .all(checkUserReacted)
  .get((req, res, next) => {

    res.send(res.reaction).end()
    // ReactionsService.matchReaction(req.app.get("db"), req.params.card_id, res.user.id)
    //   .then(reaction => {
    //     if (!reaction) {
    //       return res.status(404).end()
    //     }
    //     return res.json(ReactionsService.serializeQueriedReaction(reaction))
    //   })
    //   .catch(next)
  })
  .patch((req, res, next) => { });

reactionsRouter
  .route("/shares/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .patch((req, res, next) => { });

async function checkUserReacted(req, res, next) {
  try {
    const reaction = await ReactionsService.matchReaction(req.app.get("db"), req.params.card_id, req.user.id);

    if (!reaction) {
      // no reaction, new one should be created
      res.reaction = false
    }
    res.reaction = reaction
    next()
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
