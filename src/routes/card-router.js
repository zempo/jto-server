const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const cardRouter = express.Router();
const CardsService = require("../services/card-service");

// No auth required
cardRouter
  .route("/")
  .get((req, res, next) => {
    CardsService.getPublicCards(req.app.get("db"))
      .then((cards) => {
        res.json(CardsService.serializeCards(cards));
      })
      .catch(next);
  })
  .post((req, res) => { });

// Auth required
// post new card --> get cards 
// get cards --> delete card --> get cards
// get cards --> click card edit --> get card --> populate form values --> patch card --> get cards 
// get cards --> click make private --> recieve notificaton --> patch card public to false --> get cards, card should be missing 

cardRouter
  .route("/:card_id")
  .all(checkCardExists)
  .get((req, res) => {
    res.json(CardsService.serializeCard(res.card))
  });

/* async/await syntax for promises */
async function checkCardExists(req, res, next) {
  try {
    const card = await CardsService.getPublicById(req.app.get("db"), req.params.card_id);

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

module.exports = cardRouter;

/////// PDF methods
