const express = require("express");
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

// rename
const cardRouter = express.Router();
// rename
module.exports = cardRouter;
