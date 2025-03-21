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
    const { first_name, last_name, email, password, admin } = req.body;
  
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (first_name, last_name, email, password, member, admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            first_name,
            last_name,
            email,
            hashedPassword,
            false,
            admin === 'on', // Convert checkbox value to boolean
        ];

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
        // Fetch the logged-in user's data
        const userId = req.session.userId;
        const userQuery = 'SELECT * FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        const user = userResult.rows[0];
    
        // Fetch all messages
        const messagesQuery = `
            SELECT messages.*, users.first_name, users.last_name
            FROM messages
            JOIN users ON messages.user_id = users.id
        `;
        const messagesResult = await pool.query(messagesQuery);
        const messages = messagesResult.rows.map(row => ({
            title: row.title,
            text: row.text,
            added: new Date(row.added),
            user: `${row.first_name} ${row.last_name}`,
        }));
    
        // Render the home page with messages and user data
        res.render('home', { messages, user });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/membership", ensureAuthenticated, (req, res) => {
    res.render("membership", { error: null, success: null });
});

app.post("/membership", async (req, res) => {
    const { passcode } = req.body;
    const userId = req.session.userId;

    try {
        if (passcode !== "secret") {
            return res.render("membership", { error: "Invalid passcode", success: null });
        }

        const query = 'UPDATE users SET member = true WHERE id = $1';
        await pool.query(query, [userId]);

        res.render("membership", { error: null, success: "Congratulations! You are now a member." });
    } catch (error) {
        console.error("Error updating membership status:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/messages', ensureAuthenticated, async (req, res) => {
    const { title, text } = req.body;
    const userId = req.session.userId;

    try {
        const query = `
            INSERT INTO messages (title, text, added, user_id)
            VALUES ($1, $2, NOW(), $3)
            RETURNING *;
        `;
        const values = [title, text, userId];
        await pool.query(query, values);

        res.redirect('/home');
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
