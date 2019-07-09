const express = require("express");
const knex = require("knex");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const jsonBodyParser = express.json();
const { requireAuth } = require("../middleware/jwt-auth");
const reactionsRouter = express.Router();
const ReactionsService = require("../services/reactions-service");

// No auth required
reactionsRouter.route("/").get((req, res, next) => {
  ReactionsService.getPublicReactions(req.app.get("db"))
    .then((cards) => {
      res.json(ReactionsService.serializeReactions(cards));
    })
    .catch(next);
});

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
  .all(checkUserReacted)
  .get((req, res, next) => {
    res.send(res.reaction).end();
  })
  .patch(jsonBodyParser, (req, res, next) => {
    // console.log(res.reaction[0].id);
    let { id, hearts } = res.reaction[0];
    // console.log(ReactionsService.updateHearts(req.app.get("db"), id, reactionToUpdate));

    const reactionToUpdate = { react_hearts: "true" };
    ReactionsService.updateReactions(req.app.get("db"), id, reactionToUpdate)
      .then((numberRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);

    // if (res.reaction.length !== 0) {
    //   if (hearts === true) {
    //     const reactionToUpdate = { react_hearts: "true" };
    //     ReactionsService.updateHearts(req.app.get("db"), id, reactionToUpdate)
    //       .then((numberRowsAffected) => {
    //         return res.status(204).end();
    //       })
    //       .catch(next);
    //   } else {
    //     const reactionToUpdate = { react_hearts: "true" };
    //     ReactionsService.updateHearts(req.app.get("db"), id, reactionToUpdate)
    //       .then((numberRowsAffected) => {
    //         return res.status(204).end();
    //       })
    //       .catch(next);
    //   }
    // } else {
    //   res.send("add new").end();
    // }
  });

reactionsRouter
  .route("/shares/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .post((req, res, next) => {});

async function checkUserReacted(req, res, next) {
  try {
    const reaction = await ReactionsService.matchReaction(req.app.get("db"), req.params.card_id, req.user.id);

    if (!reaction) {
      // no reaction, new one should be created
      return (res.reaction = false);
    }
    res.reaction = reaction;
    next();
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
