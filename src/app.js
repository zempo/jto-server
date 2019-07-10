require("dotenv").config();
// const bearer = require("./middleware/bearer");
// const bodyParser = require("body-parser");
const express = require("express");
const errorCatch = require("./middleware/error");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./middleware/logger").logger;
const { NODE_ENV } = require("./config");
const winston = require("winston");

// ROUTE IMPORTS
const authRouter = require("./routes/auth-router");
const usersRouter = require("./routes/users-router");
const cardRouter = require("./routes/card-router");
const privateRouter = require("./routes/private-router");
const commentsRouter = require("./routes/comments-router");
const reactionsRouter = require("./routes/reactions-router");

const app = express();
// MIDDLEWARE
// make sure cors() is at the top
app.use(cors());

// just in case you want to post nested content for download
// https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
const morganOption = NODE_ENV === "production" ? "tiny" : "dev";
if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
app.use(morgan(morganOption));
app.use(helmet());

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/cards", cardRouter);
app.use("/api/private", privateRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/reactions", reactionsRouter);
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Just the Occasion");
});

app.use(errorCatch);

module.exports = app;
