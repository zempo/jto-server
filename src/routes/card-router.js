const express = require("express");
const path = require("path");
const uuid = require("uuid/v4");
const { isWebUri } = require("valid-url");
const pdf = require("html-pdf");

// templates
const cursiveTemplate = require("./documents/cursive");
const cursivePlusTemplate = require("./documents/cursive-plus");
const handwrittenTemplate = require("./documents/handwritten");
const handwrittenBoldTemplate = require("./documents/handwritten-bold");
const indie = require("./documents/indie");
const kiddo = require("./documents/kiddo");
const pen = require("./documents/pen");
const quill = require("./documents/quill");
const roboto = require("./documents/roboto");
const sharpie = require("./documents/sharpie");
const typed = require("./documents/typed");

// setup
const cardRouter = express.Router();

cardRouter
  .route("/")
  .get((req, res) => {
    let id = uuid();
    res.send(id);
  })
  .post((req, res) => {
    pdf.create(cursivePlusTemplate(req.body), {}).toFile(`result.pdf`, (err) => {
      if (err) {
        res.send(Promise.reject());
      }
      res.send(Promise.resolve());
    });
  });

// cardRouter.route("/:cardId").get((req, res) => {});
cardRouter.route("/1").get((req, res) => {
  const endpoint = path.join(__dirname, "../..");
  console.log(endpoint);
  res.sendFile(`${endpoint}/result.pdf`);
});

module.exports = cardRouter;
