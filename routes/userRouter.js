const express = require('express');
const passport = require('passport');
const userController = require('../controllers/userController.js');

const userRouter = express();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

userRouter.post('/', userController.createNewUser);
userRouter.get('/', passport.authenticate('local', { failureRedirect: '/login' }), userController.login);
userRouter.get('/membership', ensureAuthenticated, userController.displayMembership);
userRouter.post('/membership/patch', userController.activateMembership);

module.exports = userRouter;
