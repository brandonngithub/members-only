const pool = require("./pool");

async function addMessage(title, text) {
    await pool.query("INSERT INTO messages (title, text, added, user_id) VALUES ($1, $2, NOW(), 1)", [title, text]);
}

async function getMessages() {
    const query = `
        SELECT messages.*, users.first_name, users.last_name
        FROM messages
        JOIN users ON messages.user_id = users.id
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        title: row.title,
        text: row.text,
        added: new Date(row.added),
        user: `${row.first_name} ${row.last_name}`
    }));
}

module.exports = {
    getMessages,
    addMessage
};
