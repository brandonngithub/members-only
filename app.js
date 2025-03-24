const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const passport = require("./config/passport");
const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const messageRouter = require("./routes/messageRouter");

dotenv.config();
const app = express();

// App configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // Session lasts for 1 day
  }),
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/message", messageRouter);

app.listen(3000, () => console.log("Listening on port 3000"));
