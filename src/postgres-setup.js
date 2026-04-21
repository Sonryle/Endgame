// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

// Creating a new database instance from the connection details:
const db = pgp(process.env.PG_CONNECTION_URL);

function initialize() {
    // Create tables if they dont exist
    const query =
            "   \
                CREATE TABLE IF NOT EXISTS endgame_users ( \
                    id SERIAL PRIMARY KEY, \
                    name VARCHAR(64), \
                    mojang_username VARCHAR(16), \
                    password VARCHAR(255), \
                    email VARCHAR(64) \
                ); \
                CREATE TABLE IF NOT EXISTS endgame_exercises( \
                    id SERIAL PRIMARY KEY, \
                    name VARCHAR(32), \
                    units VARCHAR(16), \
                    custom_progression BOOLEAN \
                ); \
                CREATE TABLE IF NOT EXISTS endgame_progressions( \
                    id SERIAL PRIMARY KEY, \
                    exercise_id INT REFERENCES endgame_exercises(id), \
                    name VARCHAR(16), \
                    level INT \
                ); \
                CREATE TABLE IF NOT EXISTS endgame_history ( \
                    id SERIAL PRIMARY KEY, \
                    user_id INT REFERENCES endgame_users(id), \
                    exercise_id INT REFERENCES endgame_exercises(id), \
                    progression_id INT REFERENCES endgame_progressions(id), \
                    units DECIMAL(6, 2), \
                    completion_date DATE \
                ); \
                SELECT * FROM endgame_history WHERE user_id = 1; \
        "

    db.none(query).catch((error) => {
            console.log('ERROR: ', error);
        })

    return db;
}

// Exporting the database object for shared use:
module.exports = initialize
