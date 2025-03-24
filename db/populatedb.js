const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { Client } = require("pg");

dotenv.config();

async function main() {
  console.log("seeding...");

  const client = new Client({
    connectionString: process.env.PSQL_CONNECTION_STRING,
  });

  await client.connect();

  await client.query(`
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
    `);

  const hashedPassword1 = await bcrypt.hash("password1", 10);
  const hashedPassword2 = await bcrypt.hash("password2", 10);

  await client.query(
    `
            INSERT INTO users (first_name, last_name, email, password, member)
            VALUES
                ('Peter', 'Parker', 'peterp@gmail.com', $1, true),
                ('Mary', 'Jane', 'maryj@gmail.com', $2, false);
        `,
    [hashedPassword1, hashedPassword2],
  );

  await client.query(`
        INSERT INTO messages (title, text, added, user_id)
        VALUES
            ('Title One', 'message one', NOW(), 1),
            ('Title Two', 'message two', NOW(), 1);
    `);

  await client.end();
  console.log("done");
}

main();
