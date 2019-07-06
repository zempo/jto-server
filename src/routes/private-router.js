const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const { requireAuth } = require('../middleware/jwt-auth')
const privateRouter = express.Router();
const PrivateService = require("../services/private-service");

// auth required for user's cards
privateRouter
  .route("/cards/:user_id")
  .all(requireAuth)
  .all(checkForPrivateCards)
  .get((req, res) => {
    // console.log(req.user)
    // console.log(res.cards[0]['user:id'])
    // or if admin boolean, eventually? 
    if (req.user.id === res.cards[0]['user:id']) {
      res.json(PrivateService.serializeCards(res.cards));
    } else {
      res.status(403).end()
    }
  });

// Auth required
// post new private card --> get private cards 
// get private cards --> delete private card --> get private cards
// get private cards --> click private card edit --> get private card --> populate form values --> patch private card --> get private cards 
// get private cards --> click make private --> recieve notificaton --> patch private card public to false --> get private cards, private card should be missing 

privateRouter
  .route("/cards/:user_id/:card_id")
  .all(requireAuth)
  .all(checkCardStillPrivate)
  .get((req, res) => {
    if (req.user.id === res.card[0]['user:id']) {
      // res.json(PrivateService.serializeCards(res.cards));
      res.json(PrivateService.serializeCards(res.card))
    } else {
      res.status(403).end()
    }
    // res.send(res.card)
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
    // const cards = await PrivateService.getPrivateCards()
    const card = await PrivateService.getPrivateById(req.app.get("db"), req.params.user_id, req.params.card_id);
    // console.log(req.user)
    if (card.length === 0)
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
