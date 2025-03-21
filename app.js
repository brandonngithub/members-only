const express = require("express");
const app = express();

const { getMessages } = require('./db/query');

const path = require("node:path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/home", async (req, res) => {
    try {
        const messages = await getMessages();
        res.render('home', { messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
