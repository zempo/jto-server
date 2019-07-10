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
        // if we get don't get a null for error, we step out of function
        let allKeysError = await service.checkAllFields(user);
        if (allKeysError) return res.status(400).json({ error: allKeysError });

        let emailError = await service.validateEmail(user.email);
        if (emailError) return res.status(400).json({ error: emailError });

        let passwordError = await service.validatePassword(user.password);
        if (passwordError) return res.status(400).json({ error: passwordError });

        let userNameExists = await service.uniqueUserName(req.app.get("db"), user.user_name);
        console.log(user.email);
        if (userNameExists) return res.status(400).json({ error: "Username already taken." });

        let emailExists = await service.uniqueEmail(req.app.get("db"), user.email);
        if (emailExists) return res.status(400).json({ error: "An account with this email has already been created." });
        // else passing, return a response
        return res.send("user passes validation");
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
