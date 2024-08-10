const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Setup database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            duration INTEGER NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);
    }
});

// Route untuk menampilkan daftar kursus
app.get('/', (req, res) => {
    const sql = "SELECT * FROM courses";
    db.all(sql, [], (err, courses) => {
        if (err) {
            return res.status(500).send("Error accessing database");
        }
        res.render('index', { courses });
    });
});

// Route untuk form menambah kursus baru
app.get('/course/new', (req, res) => {
    res.render('new-course');
});

// Route untuk menambah kursus baru
app.post('/course/new', (req, res) => {
    const { title, description, duration } = req.body;
    const sql = "INSERT INTO courses (title, description, duration) VALUES (?, ?, ?)";
    db.run(sql, [title, description, duration], (err) => {
        if (err) {
            return res.status(500).send("Error adding course to database");
        }
        res.redirect('/');
    });
});


// Route untuk form mengedit materi
app.get('/course/:courseId/material/edit/:materialId', (req, res) => {
    const { courseId, materialId } = req.params;
    const sql = "SELECT * FROM materials WHERE id = ?";
    db.get(sql, [materialId], (err, material) => {
        if (err) {
            return res.status(500).send("Error accessing database");
        }
        if (!material) {
            return res.status(404).send("Material not found");
        }
        res.render('edit-material', { courseId, material });
    });
});


// Route untuk mengedit materi
app.post('/course/:courseId/material/edit/:materialId', (req, res) => {
    const { courseId, materialId } = req.params;
    const { title, content, embed_url } = req.body;
    const sql = "UPDATE materials SET title = ?, content = ?, embed_url = ? WHERE id = ?";
    db.run(sql, [title, content, embed_url, materialId], (err) => {
        if (err) {
            return res.status(500).send("Error updating material in database");
        }
        res.redirect(`/course/${courseId}/materials`);
    });
});


// Route untuk menghapus kursus
app.get('/course/delete/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = "DELETE FROM courses WHERE id = ?";
    db.run(sql, [courseId], (err) => {
        if (err) {
            return res.status(500).send("Error deleting course from database");
        }
        res.redirect('/');
    });
});

// Route untuk melihat materi kursus
app.get('/course/:id/materials', (req, res) => {
    const courseId = req.params.id;
    const sql = "SELECT * FROM materials WHERE course_id = ?";
    db.all(sql, [courseId], (err, materials) => {
        if (err) {
            return res.status(500).send("Error accessing database");
        }
        res.render('materials', { materials, courseId });
    });
});

// Route untuk form menambah materi baru
app.get('/course/:id/material/new', (req, res) => {
    const courseId = req.params.id;
    res.render('new-material', { courseId });
});

// Route untuk melihat materi kursus
app.get('/course/:id/materials', (req, res) => {
    const courseId = req.params.id;
    const sql = "SELECT * FROM materials WHERE course_id = ?";
    db.all(sql, [courseId], (err, materials) => {
        if (err) {
            return res.status(500).send("Error accessing database");
        }
        res.render('materials', { materials });
    });
});


// Route untuk menambah materi baru
app.post('/course/:id/material/new', (req, res) => {
    const courseId = req.params.id;
    const { title, content, embed_url } = req.body;
    const sql = "INSERT INTO materials (course_id, title, content, embed_url) VALUES (?, ?, ?, ?)";
    db.run(sql, [courseId, title, content, embed_url], (err) => {
        if (err) {
            return res.status(500).send("Error adding material to database");
        }
        res.redirect(`/course/${courseId}/materials`);
    });
});


// Route untuk mengedit materi
app.post('/course/material/edit/:id', (req, res) => {
    const materialId = req.params.id;
    const { title, content, embed_url } = req.body;
    const sql = "UPDATE materials SET title = ?, content = ?, embed_url = ? WHERE id = ?";
    db.run(sql, [title, content, embed_url, materialId], (err) => {
        if (err) {
            return res.status(500).send("Error updating material in database");
        }
        res.redirect(`/course/${courseId}/materials`);
    });
});

// Route untuk menghapus materi
app.get('/course/:courseId/material/delete/:materialId', (req, res) => {
    const { courseId, materialId } = req.params;
    const sql = "DELETE FROM materials WHERE id = ?";
    db.run(sql, [materialId], (err) => {
        if (err) {
            return res.status(500).send("Error deleting material from database");
        }
        res.redirect(`/course/${courseId}/materials`);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
