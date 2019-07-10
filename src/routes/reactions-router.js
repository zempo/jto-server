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

reactionsRouter
  .route("/:card_id")
  .all(checkCardExists)
  .get((req, res) => {
    res.json(ReactionsService.serializeReactionCount(res.card));
  });

reactionsRouter
  .route("/hearts/:card_id")
  .all(requireAuth)
  .get(checkUserReacted, (req, res, next) => {
    // if you get a card, do a post
    // if you don't, do a patch
    // optimize on front-end
    res.send(res.reaction).end();
  })
  .patch(checkUserReacted, jsonBodyParser, (req, res, next) => {
    // IF res.reaction, do PATCH
    // IF NO res.reaction do POST
    const { id, react_heart } = res.reaction[0];
    console.log(react_heart);
    if (react_heart === true) {
      const updatedReaction = { react_heart: "false" };

      ReactionsService.updateReactions(req.app.get("db"), id, updatedReaction)
        .then((numRowsAffected) => {
          return res.status(204).end();
        })
        .catch(next);
    } else {
      const updatedReaction = { react_heart: "true" };

      ReactionsService.updateReactions(req.app.get("db"), id, updatedReaction)
        .then((numRowsAffected) => {
          return res.status(204).end();
        })
        .catch(next);
    }
  })
  .post(jsonBodyParser, (req, res, next) => {
    // IF res.reaction, do PATCH
    // IF NO res.reaction do POST
    // let { react_heart } = req.body;
    let newReaction = { react_heart: "true" };
    newReaction.user_id = req.user.id;
    newReaction.card_id = Number(req.params.card_id);
    // newReaction.react_heart = true;
    console.log(newReaction);

    // res.send(newReaction).end();
    ReactionsService.insertReaction(req.app.get("db"), newReaction)
      .then((reaction) => {
        res
          .status(201)
          .json(reaction)
          .end();
      })
      .catch(next);
  });

reactionsRouter
  .route("/shares/:card_id")
  .all(requireAuth)
  .all(checkUserReacted)
  .get((req, res, next) => {
    res.send(res.reaction).end();
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { id, react_share } = res.reaction[0];
    console.log(react_share);
    const updatedReaction = { react_share: "true" };

    ReactionsService.updateReactions(req.app.get("db"), id, updatedReaction)
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    // IF res.reaction, do PATCH
    // IF NO res.reaction do POST
    // let { react_heart } = req.body;
    let newReaction = { react_share: "true" };
    newReaction.user_id = req.user.id;
    newReaction.card_id = Number(req.params.card_id);
    // newReaction.react_heart = true;
    console.log(newReaction);

    // res.send(newReaction).end();
    ReactionsService.insertReaction(req.app.get("db"), newReaction)
      .then((reaction) => {
        res
          .status(201)
          .json(reaction)
          .end();
      })
      .catch(next);
  });

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
