const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR (255),
    last_name VARCHAR (255),
    email VARCHAR (255),
    password VARCHAR (255),
    member BOOLEAN,
    admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR (255),
    text VARCHAR (255),
    added TIMESTAMP,
    user_id INTEGER,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

INSERT INTO users (first_name, last_name, email, password, member) 
VALUES
    ('Brandon', 'Ngo', 'brandonn@gmail.com', 'password1', true),
    ('Harsh', 'Kuddu', 'harshk@gmail.com', 'password2', false);

INSERT INTO messages (title, text, added, user_id) 
VALUES
    ('Title One', 'message one', NOW(), 1),
    ('Title Two', 'message two', NOW(), 1);
`;

async function main() {
    console.log('seeding...');
    const client = new Client({
        connectionString: process.env.PSQL_CONNECTION_STRING,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log('done');
}

main();
