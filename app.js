const express = require("express");
const app = express();

const { getMessages } = require('./db/query');
const pool = require('./db/pool');
const bcrypt = require('bcrypt');

const path = require("node:path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password');
        }

        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
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
