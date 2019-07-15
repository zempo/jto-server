const express = require("express");
const path = require("path");
const { isWebUri } = require("valid-url");
const { requireAuth } = require("../middleware/jwt-auth");
const cloudinary = require("cloudinary");
const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../config");
// setup
const privateRouter = express.Router();
const jsonBodyParser = express.json();
const PrivateService = require("../services/private-service");
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

// auth required for user's cards
privateRouter
  .route("/cards/:user_id")
  .all(requireAuth)
  .all(checkForPrivateCards)
  .get((req, res) => {
    if (req.user.id === res.cards[0]["user:id"]) {
      res.json(PrivateService.serializeCards(res.cards));
    } else {
      res.status(403).end();
    }
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { theme, front_message, front_image, inside_message, inside_image } = req.body;

    const newCard = { theme, front_message, front_image, inside_message, inside_image };

    const error = PrivateService.postValidator(newCard);
    if (error) {
      return res.status(400).json(error);
    } else if (front_image && !isWebUri(front_image)) {
      return res.status(400).json({ error: `Image url must be valid url.` });
    } else if (inside_image && !isWebUri(inside_image)) {
      return res.status(400).json({ error: `Image url must be valid url.` });
    }

    newCard.user_id = req.user.id;

    PrivateService.insertCard(req.app.get("db"), newCard)
      .then((card) => {
        // console.log(card[0]["id"]);
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${card[0]["id"]}`))
          .json(PrivateService.serializeCard(card[0]));
      })
      .catch(next);
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
    if (req.user.id === res.card[0]["user:id"]) {
      res.json(PrivateService.serializeCards(res.card));
    } else {
      res.status(403).end();
    }
  })
  .delete((req, res, next) => {
    if (req.user.id === res.card[0]["user:id"]) {
      PrivateService.deleteCard(req.app.get("db"), req.params.card_id)
        .then((numberRowsAffected) => {
          res.status(204).end();
        })
        .catch(next);
    } else {
      res.status(403).end();
    }
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { theme, front_message, front_image, inside_message, inside_image } = req.body;

    const cardToUpdate = { theme, front_message, front_image, inside_message, inside_image };
    cardToUpdate.date_modified = new Date().toLocaleString();

    const error = PrivateService.patchValidator(cardToUpdate);
    if (error) {
      return res.status(400).json(error);
    }

    if (req.user.id === res.card[0]["user:id"]) {
      PrivateService.updateCard(req.app.get("db"), req.params.card_id, cardToUpdate)
        .then((numberRowsAffected) => {
          return res.status(204).end();
        })
        .catch(next);
    } else {
      res.status(403).end();
    }
  });

// toggle a card's privacy
privateRouter
  .route("/make-public/:user_id/:card_id")
  .all(requireAuth)
  .all(checkCardStillPrivate)
  .patch(jsonBodyParser, (req, res, next) => {
    const cardToUpdate = { public: "true" };

    if (req.user.id === res.card[0]["user:id"]) {
      PrivateService.updateCard(req.app.get("db"), req.params.card_id, cardToUpdate)
        .then((numberRowsAffected) => {
          return res.status(204).end();
        })
        .catch(next);
    } else {
      res.status(403).end();
    }
  });

async function checkForPrivateCards(req, res, next) {
  try {
    const cards = await PrivateService.getPrivateCards(req.app.get("db"), req.params.user_id);

    res.cards = cards;
    next();
  } catch (error) {
    next(error);
  }
}

async function checkCardStillPrivate(req, res, next) {
  try {
    const card = await PrivateService.getPrivateById(req.app.get("db"), req.params.user_id, req.params.card_id);
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
