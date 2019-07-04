const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const privateRouter = express.Router();
const PrivateService = require("../services/private-service");

// auth required for user's cards
privateRouter
  .route("/cards/:user_id")
  .all(checkForPrivateCards)
  .get((req, res) => {
    res.json(PrivateService.serializeCards(res.cards));
  });

privateRouter
  .route("/:user_id/:card_id")
  .all(checkCardStillPrivate)
  .get((req, res) => {
    res.json(PrivateService.serializeCards(res.cards))
  })

async function checkForPrivateCards(req, res, next) {
  try {
    const cards = await PrivateService.getPrivateCards(req.app.get("db"), req.params.user_id)
    res.cards = cards
    next()
  } catch (error) {
    next(error)
  }
}

async function checkCardStillPrivate(req, res, next) {
  try {
    const card = await PrivateService.getPrivateById(db, req.params.user_id, req.params.card_id);
    console.log(card)
    if (!card)
      return res.status(404).json({
        error: `This card is no longer private. It might have been deleted or made public.`
      });

    res.card = card;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = privateRouter;
