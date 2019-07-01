require("dotenv").config();

// Bearer AUTH
const bearer = require("./middleware/bearer");
//

const bodyParser = require("body-parser");
const express = require("express");
const errorCatch = require("./middleware/error");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./middleware/logger").logger;
const { PORT, NODE_ENV } = require("./config");
const winston = require("winston");

// ROUTE IMPORTS
const cardRouter = require("./routes/card-router");
const privateRouter = require('./routes/private-router')

const app = express();
// MIDDLEWARE
// make sure cors() is at the top
app.use(cors());
// app.use(bearer);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
app.use("/api/cards", cardRouter);
app.use('/api/private', privateRouter)

app.get("/", (req, res) => {
  res.send("Just the Occasion");
});

app.use(errorCatch);

module.exports = app;
