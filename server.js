const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// ฟังก์ชันสร้างแฮช MD5
function createMD5Hash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

const app = express();
const port = 3000;

// ตั้งค่า EJS และ static files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ตั้งค่า session
app.use(session({
    secret: 'ctf_secret_key',
    resave: false,
    saveUninitialized: false
}));

// ตั้งค่าฐานข้อมูล SQLite
const db = new sqlite3.Database(path.join(__dirname, 'public', 'shop.db'));

// หน้าแรก - แสดงสินค้าและฟอร์มค้นหา
app.get('/', (req, res) => {
    const searchQuery = req.query.search || '';
    let sql = "SELECT id, name, price, image_url FROM products";
    let params = [];
    
    if (searchQuery) {
        sql += " WHERE name LIKE ?";
        params = [`%${searchQuery}%`]; // ใช้ LIKE สำหรับค้นหา case-insensitive
    }
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('index', { products: rows, searchQuery: searchQuery });
    });
});

// หน้า login
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = createMD5Hash(password);
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, hashedPassword], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
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
    res.download(path.join(__dirname, 'public', 'shop.db'));
});

// 404 สำหรับหน้าไม่พบ
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});