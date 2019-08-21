const express = require("express");

// setup
const { requireAuth } = require("../middleware/jwt-auth");
const cardRouter = express.Router();
const jsonBodyParser = express.json();
const CardsService = require("../services/card-service");
const PrivateService = require("../services/private-service");

// No auth required
cardRouter.route("/").get((req, res, next) => {
  CardsService.getPublicCards(req.app.get("db"))
    .then((cards) => {
      res.json(CardsService.serializeCards(cards));
    })
    .catch(next);
});

// Auth required
// post new card --> get cards
// get cards --> delete card --> get cards
// get cards --> click card edit --> get card --> populate form values --> patch card --> get cards
// get cards --> click make private --> recieve notificaton --> patch card public to false --> get cards, card should be missing

cardRouter
  .route("/:card_id")
  .all(checkCardExists)
  .get((req, res) => {
    res.json(CardsService.serializeCard(res.card));
  })
  .delete(requireAuth, (req, res, next) => {
    if (req.user.admin) {
      // make a delete service
      PrivateService.deleteCard(req.app.get("db"), res.card["id"])
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
        const error = await service.patchValidator(card);
        if (error) return res.status(400).json(error);

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

cardRouter
  .route("/comments/:card_id")
  .all(checkCardExists)
  .get((req, res, next) => {
    CardsService.getCommentsByCard(req.app.get("db"), res.card["id"])
      .then((comments) => {
        res.json(CardsService.serializeCardComments(comments));
      })
      .catch(next);
  });

cardRouter
  .route("/make-private/:card_id")
  .all(requireAuth)
  .all(checkCardExists)
  .patch(jsonBodyParser, (req, res, next) => {
    // toggle a card's privacy
    const cardToUpdate = { public: "false" };

    if (req.user.id === res.card["user:id"]) {
      PrivateService.updateCard(req.app.get("db"), req.params.card_id, cardToUpdate)
        .then((numberRowsAffected) => {
          return res.status(204).end();
        })
        .catch(next);
    } else {
      res.status(403).end();
    }
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
