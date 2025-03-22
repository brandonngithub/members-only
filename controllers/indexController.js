const db = require('../db/queries.js');

async function displayHomepage(req, res) {
    try {
        const user = req.user;
        const messages = await db.getMessages();
        res.render('home', { messages, user });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    displayHomepage
};
