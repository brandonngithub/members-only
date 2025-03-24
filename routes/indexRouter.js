const express = require("express");
const indexController = require("../controllers/indexController.js");
const { ensureAuthenticated } = require("../controllers/helper.js");

const indexRouter = express();

indexRouter.get("/", ensureAuthenticated, indexController.displayHomepage);

module.exports = indexRouter;
