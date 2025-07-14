const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// ตั้งค่า EJS และ static files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const rateLimit = require('express-rate-limit');
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100 // จำกัด 100 requests ต่อ IP
}));

// ตั้งค่า session
app.use(session({
    secret: 'ctf_secret_key',
    resave: false,
    saveUninitialized: false
}));

// ตั้งค่าฐานข้อมูล SQLite
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)");
    db.run("INSERT INTO products (name, price) VALUES ('Laptop', 1000), ('Phone', 500)");
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'supersecretpass')");
});

// หน้าแรก - แสดงสินค้าและฟอร์มค้นหา
app.get('/', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        res.render('index', { products: rows });
    });
});

// หน้า login
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (row) {
            req.session.isAdmin = true;
            res.redirect('/admin-panel');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    });
});

// หน้า admin-panel (ต้องล็อกอิน)
app.get('/admin-panel', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).render('404');
    }
    res.render('admin-panel');
});

// หน้า backup (ซ่อนอยู่)
app.get('/backup', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.download(path.join(__dirname, 'public', 'database.sql'));
});

// 404 สำหรับหน้าไม่พบ
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});