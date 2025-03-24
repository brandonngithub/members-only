const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

module.exports = new Pool({
    connectionString: process.env.PSQL_CONNECTION_STRING,
});
