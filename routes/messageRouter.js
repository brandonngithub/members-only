const express = require('express');
const messageController = require('../controllers/messageController.js');
const { ensureAuthenticated } = require('../controllers/helper.js');

const messageRouter = express();

messageRouter.post('/', ensureAuthenticated, messageController.createMessage);
messageRouter.get('/:id/delete', ensureAuthenticated, messageController.deleteMessage);

module.exports = messageRouter;
