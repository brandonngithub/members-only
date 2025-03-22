const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController.js');
const { ensureAuthenticated } = require('../controllers/helper.js');

const userRouter = express();

userRouter.post('/', userController.createNewUser);
userRouter.get('/', passport.authenticate('local', { failureRedirect: '/login' }), userController.login);
userRouter.get('/membership', ensureAuthenticated, userController.displayMembership);
userRouter.post('/membership/patch', userController.activateMembership);

module.exports = userRouter;
