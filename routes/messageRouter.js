const express = require('express');
const messageController = require('../controllers/messageController.js');

const messageRouter = express();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

messageRouter.post('/', ensureAuthenticated, messageController.createMessage);
messageRouter.get('/:id/delete', ensureAuthenticated, messageController.deleteMessage);

module.exports = messageRouter;
