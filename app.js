const express = require("express");
const app = express();
const session = require('express-session');

const { getMessages } = require('./db/query');
const pool = require('./db/pool');
const bcrypt = require('bcrypt');

const path = require("node:path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
    session({
        secret: 'my_secret_key',
        resave: false, // Don't save the session if it wasn't modified
        saveUninitialized: false, // Don't create a session until something is stored
        cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // Session lasts for 1 day
    })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
  
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
        INSERT INTO users (first_name, last_name, email, password, member)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `;
        const values = [first_name, last_name, email, hashedPassword, false];
        await pool.query(query, values);

        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).render('login', { error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).render('login', { error: 'Invalid email or password' });
        }

        req.session.userId = user.id;
        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', ensureAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

app.get("/home", ensureAuthenticated, async (req, res) => {
    try {
        const messages = await getMessages();
        res.render('home', { messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
