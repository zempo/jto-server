const express = require("express");
const path = require("path");

// setup
const UsersService = require("../services/users-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .route("/")
  .get((req, res, next) => {
    // for profile creation?
    // get a particular user
    // require authentication --> while logged-in, user will be displayed "logged in as John Doe" or "Welcome, John Doe"
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name, email } = req.body;
    const newUser = { password, user_name, full_name, email };

    async function validateUser(user, service) {
      try {
        // if we get an error, we step out of function
        let missingKeys = await service.checkAllFields(user);
        if (missingKeys) return res.status(400).json({ error: missingKeys });

        let invalidEmail = await service.validateEmail(user.email);
        if (invalidEmail) return res.status(400).json({ error: invalidEmail });

        let invalidPassword = await service.validatePassword(user.password);
        if (invalidPassword) return res.status(400).json({ error: invalidPassword });

        let userNameExists = await service.uniqueUserName(req.app.get("db"), user.user_name);
        if (userNameExists) return res.status(400).json({ error: "Username already taken." });

        let emailExists = await service.uniqueEmail(req.app.get("db"), user.email);
        if (emailExists) return res.status(400).json({ error: "An account with this email has already been created." });

        // then we hash password
        let hashpwd = await service.hashPassword(user.password);
        user.password = hashpwd;

        // then we insert the new user
        let insertedUser = await service.insertUser(req.app.get("db"), user);
        if (!insertedUser) return res.status(500).json({ error: "Sorry, something is wrong with our servers :/" });

        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${insertedUser.id}`))
          .json(service.serializeUser(insertedUser));
      } catch (error) {
        next(error);
      }
    }

    const result = validateUser(newUser, UsersService);
    result;
    // const emailError = UsersService.validateEmail(email);
    // if (emailError) return res.status(400).json({ error: emailError });

    // const passwordError = UsersService.validatePassword(password);
    // if (passwordError) return res.status(400).json({ error: passwordError });
  });

module.exports = usersRouter;
