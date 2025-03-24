const passport = require('passport');
const passportLocal = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../db/queries.js');

const LocalStrategy = passportLocal.Strategy;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
        try {
            const user = await db.getUser(email, 'email');

            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

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
        const user = await db.getUser(id, 'id');

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
