const pool = require('./pool');

// Add a message
async function addMessage(title, text, userId) {
    const query = `
        INSERT INTO messages (title, text, added, user_id)
        VALUES ($1, $2, NOW(), $3)
        RETURNING *;
    `;
    const values = [title, text, userId];
    await pool.query(query, values);
}

// Gets all messages with their authors
async function getMessages() {
    const query = `
        SELECT messages.*, users.first_name, users.last_name
        FROM messages
        JOIN users ON messages.user_id = users.id
    `;

    const { rows } = await pool.query(query);

    return rows.map(row => ({
        id: row.id,
        title: row.title,
        text: row.text,
        added: new Date(row.added),
        user: `${row.first_name} ${row.last_name}`,
    }));
}

// Deletes a message of a specific id
async function deleteMessage(id) {
    const query = 'DELETE FROM messages WHERE id = $1';
    await pool.query(query, [id]);
}

// Adds a user but needs to be called with all parameters except member bc default not a member
async function addUser(first, last, email, password, admin) {
    const query = `
        INSERT INTO users (first_name, last_name, email, password, member, admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [first, last, email, password, false, admin];

    await pool.query(query, values);
}

// Gets a user by id or meial
async function getUser(value, by='id') {
    let query;

    if (by === 'id') {
        query = 'SELECT * FROM users WHERE id = $1';
    } else if (by === 'email') {
        query = 'SELECT * FROM users WHERE email = $1';
    } else {
        throw new Error('Invalid query type. Use "id" or "email".');
    }

    const { rows } = await pool.query(query, [value]);
    return rows.length === 0 ? null : rows[0];
}

// Makes a user into a member
async function updateUser(id) {
    const query = 'UPDATE users SET member = true WHERE id = $1';
    await pool.query(query, [id]);
}

module.exports = {
    getUser,
    addUser,
    getMessages,
    updateUser,
    addMessage,
    deleteMessage
};
