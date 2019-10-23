const express = require("express");
const path = require("path");
const { isWebUri } = require("valid-url");
const { requireAuth } = require("../middleware/jwt-auth");
// cloudinary
const cloudinary = require("cloudinary");
const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../config");
const formData = require("express-form-data");
// setup
const privateRouter = express.Router();
privateRouter.use(formData.parse());
const jsonBodyParser = express.json();
const PrivateService = require("../services/private-service");
const CloudService = require("../services/cloud-service");

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

// to-do: require auth
privateRouter.route("/images").post(requireAuth, (req, res, next) => {
  // upload the files, first
  async function processImages(files, service) {
    try {
      const sizeError = await service.validateSize(files);
      if (sizeError) {
        return res.status(413).json({ error: sizeError });
      }

      const sendToCloud = await service.uploadByFilePath(files);
      if (sendToCloud.find((file) => file === "NSFW content added")) {
        return res.status(400).json({ error: "No inappropriate images accepted" });
      }

      // console.log(sendToCloud);

      return res.location(req.originalUrl).send(sendToCloud);
    } catch (error) {
      next(error);
    }
  }
  const processedImages = processImages(req.files, CloudService);
  processedImages;
});

// auth required for user's cards
privateRouter
  .route("/cards/:user_id")
  .all(requireAuth)
  .get(checkForPrivateCards, (req, res) => {
    if (req.user.id === res.cards[0]["user:id"]) {
      res.json(PrivateService.serializeCards(res.cards));
    } else {
      res.status(403).end();
    }
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { theme, front_message, front_image, inside_message, inside_image } = req.body;

    const newCard = { theme, front_message, front_image, inside_message, inside_image };

    async function validateCard(card, service) {
      try {
        const error = await service.postValidator(card);
        if (error) return res.status(400).json(error);
        card.user_id = req.user.id;

        const sanitizeFront = await service.sanitizeCard(card.front_message);
        if (sanitizeFront) {
          card.front_message = sanitizeFront;
        }
        const sanitizeInside = await service.sanitizeCard(card.inside_message);
        if (sanitizeInside) {
          card.inside_message = sanitizeInside;
        }

        const insertedCard = await service.insertCard(req.app.get("db"), card);

        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${insertedCard[0]["id"]}`))
          .json(PrivateService.serializeCard(insertedCard[0]));
      } catch (error) {
        next(error);
      }
    }

    const result = validateCard(newCard, PrivateService);
    result;
  });

// Auth required

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
    const numberOfValues = Object.values(cardToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: "Request body must include either theme, front_message, front_image, inside_message, or inside_image"
      });
    }
    cardToUpdate.date_modified = new Date().toLocaleString();

    async function correctPatch(card, service) {
      try {
        const wrongUser = await service.correctUser(req.user.id, res.card[0]["user:id"]);
        if (wrongUser) return res.status(403).json(wrongUser);

        const error = await service.patchValidator(card);
        if (error) return res.status(400).json(error);
        // card.user_id = req.user.id;

        if (card.front_message != null) {
          const sanitizeFront = await service.sanitizeCard(card.front_message);
          card.front_message = sanitizeFront;
        }
        if (card.inside_message != null) {
          const sanitizeInside = await service.sanitizeCard(card.inside_message);
          card.inside_message = sanitizeInside;
        }

        const updatedCard = await service.updateCard(req.app.get("db"), req.params.card_id, card);
        if (!updatedCard) {
          return res.status(409).json({ error: "request timeout" });
        }

        return res.status(204).end();
      } catch (error) {
        next(error);
      }
    }

    const result = correctPatch(cardToUpdate, PrivateService);
    result;
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
    if (cards.length === 0) return res.status(404).json({ error: "This user has no private cards at the moment." });

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
