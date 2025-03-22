const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require('node:path');
const pool = require('./db/pool');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // Session lasts for 1 day
    })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const query = 'SELECT * FROM users WHERE email = $1';
                const { rows } = await pool.query(query, [email]);

                if (rows.length === 0) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                const user = rows[0];
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return done(null, false);
        }

        const user = rows[0];
        done(null, user);
    } catch (error) {
        done(error);
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
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
            admin === 'on',
        ];

        await pool.query(query, values);

        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/home');
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

app.get('/home', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;

        const messagesQuery = `
            SELECT messages.*, users.first_name, users.last_name
            FROM messages
            JOIN users ON messages.user_id = users.id
        `;
        const messagesResult = await pool.query(messagesQuery);
        const messages = messagesResult.rows.map(row => ({
            id: row.id,
            title: row.title,
            text: row.text,
            added: new Date(row.added),
            user: `${row.first_name} ${row.last_name}`,
        }));

        res.render('home', { messages, user });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/membership', ensureAuthenticated, (req, res) => {
    res.render('membership', { error: null, success: null });
});

app.post('/membership', async (req, res) => {
    const { passcode } = req.body;
    const user = req.user;

    try {
        if (user.admin) {
            return res.render('membership', { error: null, success: 'You are already an admin.' });
        }

        if (passcode !== 'secret') {
            return res.render('membership', { error: 'Invalid passcode', success: null });
        }

        const query = 'UPDATE users SET member = true WHERE id = $1';
        await pool.query(query, [userId]);

        res.render('membership', { error: null, success: 'Congratulations! You are now a member.' });
    } catch (error) {
        console.error('Error updating membership status:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/messages', ensureAuthenticated, async (req, res) => {
    const { title, text } = req.body;
    const user = req.user;

    try {
        if (!user.member && !user.admin) {
            return res.status(403).send('Forbidden: You must be a member to create messages.');
        }

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

app.post('/messages/:id/delete', ensureAuthenticated, async (req, res) => {
    const messageId = req.params.id;
    const user = req.user;

    try {
        if (!user.admin) {
            return res.status(403).send('Forbidden: Only admins can delete messages.');
        }

        const deleteQuery = 'DELETE FROM messages WHERE id = $1';
        await pool.query(deleteQuery, [messageId]);

        res.redirect('/home');
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));
