const express = require('express');
const indexController = require('../controllers/indexController.js');

const indexRouter = express();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

indexRouter.get('/', ensureAuthenticated, indexController.displayHomepage);

module.exports = indexRouter;
