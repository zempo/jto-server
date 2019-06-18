const winston = require("winston");

// set up winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })]
});

module.exports = { logger };

/*
Winston has six levels of severity: silly, debug, verbose, info, warn and error.
 You can configure Winston to log at different levels for different environments.
  Here we are setting the level to info. This means that it will log everything with a severity of info and greater.
  It is also possible to format the log output in a number of ways or even choose where the logs will be stored.
  Here the logs will be stored in a file named info.log in JSON format. But in the development environment, it will also log to the console.
  We will add logging statements to the code below.
 */
