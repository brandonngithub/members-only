const express = require("express");
const authController = require("../controllers/authController.js");

const authRouter = express();

authRouter.get("/signup", authController.displaySignup);
authRouter.get("/login", authController.displayLogin);
authRouter.get("/logout", authController.logout);

module.exports = authRouter;
