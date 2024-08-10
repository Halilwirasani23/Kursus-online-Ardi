const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                duration INTEGER NOT NULL,
                embed_url TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                embed_url TEXT,
                FOREIGN KEY (course_id) REFERENCES courses(id)
            )`, (err) => {
                if (err) {
                    console.error('Error creating materials table:', err.message);
                } else {
                    console.log('Materials table created or already exists');
                }
            });
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
    }
});