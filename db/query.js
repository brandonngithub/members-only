const pool = require("./pool");

async function addMessage(title, text) {
    await pool.query("INSERT INTO messages (title, text, added, user_id) VALUES ($1, $2, NOW(), 1)", [title, text]);
}

async function getMessages() {
    const { rows } = await pool.query("SELECT * FROM messages");
    return rows.map(row => ({
        title: row.title,
        text: row.text,
        added: new Date(row.added),
        user_id: row.user_id
    }));
}

module.exports = {
    getMessages,
    addMessage
};
