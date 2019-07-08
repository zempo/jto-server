const express = require("express");
const AuthService = require("../services/auth-service");
const { requireAuth } = require("../middleware/jwt-auth");

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { email, password } = req.body;
  const loginUser = { email, password };

  for (const [key, value] of Object.entries(loginUser)) {
    if (value == undefined || value == null) {
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });
    }
  }

  AuthService.getUserWithEmail(req.app.get("db"), loginUser.email).then((dbUser) => {
    if (!dbUser) {
      return res.status(400).json({
        error: "Incorrect email or password"
      });
    }
    return AuthService.comparePasswords(loginUser.password, dbUser.password)
      .then((matching) => {
        if (!matching) {
          return res.status(400).json({
            error: "Incorrect email or password"
          });
        }
        const sub = dbUser.email;
        const payload = { user_id: dbUser.id };
        res.send({
          authToken: AuthService.createJwt(sub, payload)
        });
      })
      .catch(next);
  });
});

authRouter
  .route("/refresh")
  .all(requireAuth)
  .post((req, res, next) => {
    const sub = req.user.email;
    const payload = { user_id: req.user.id };
    res.send({ authToken: AuthService.createJwt(sub, payload) });
  });

module.exports = authRouter;
