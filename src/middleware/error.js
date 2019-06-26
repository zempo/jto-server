require("dotenv").config();
const { NODE_ENV } = require("../config");

const errorCatch = (error, req, res, next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
};

module.exports = errorCatch;
