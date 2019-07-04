const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");

// setup
const privateRouter = express.Router();
const PrivateService = require("../services/private-service");

// auth required for user's cards
privateRouter.route("/:user_id").get((req, res, next) => {
  PrivateService.getPrivateCards(req.app.get("db"), req.params.user_id)
    .then((cards) => {
      res.json(PrivateService.serializeCards(cards));
    })
    .catch(next);
});

module.exports = privateRouter;
