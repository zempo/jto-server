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
  })
  .post((req, res, next) => {
    res.send("post here");
  });

module.exports = usersRouter;
