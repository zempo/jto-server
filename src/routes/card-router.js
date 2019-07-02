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
  .post((req, res) => {});

// Auth required
cardRouter.route("/:cardId").get((req, res, next) => {});

module.exports = cardRouter;

/////// PDF methods
