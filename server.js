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
const os = require('os');

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

// Middleware สำหรับ Basic Authentication
function basicAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.set('WWW-Authenticate', 'Basic realm="Backup Access"');
        return res.status(401).send('Authentication required');
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    if (username === 'notatord' && password === 'ghjkl;') {
        return next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="Backup Access"');
        return res.status(401).send('Invalid credentials');
    }
}

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
            if (username === 'admin') {
                req.session.isAdmin = true;
                res.redirect('/admin-panel');
            } else {
                req.session.isAdmin = false;
                res.send('Please login with admin credentials. ;)');
            }
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    });
});

app.get('/admin-panel', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).render('404');
    }
    res.render('admin-panel', { error: null, flag: null });
});

app.post('/admin-panel', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).render('404');
    }
    const { key } = req.body;
    if (!key) {
        return res.render('admin-panel', { error: 'Key is required', flag: null });
    }
    db.get("SELECT encoded_flag FROM encoded_key WHERE id = ?", [1], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).render('admin-panel', { error: 'Internal Server Error', flag: null });
        }
        if (!row) {
            return res.render('admin-panel', { error: 'Flag not found', flag: null });
        }
        const decodedFlag = Buffer.from(row.encoded_flag, 'base64').toString();
        if (key === decodedFlag) {
            res.render('admin-panel', { error: null, flag: "ISAG{kawaii_raz0r_bl4de5}" });
        } else {
            res.render('admin-panel', { error: 'Invalid key', flag: null });
        }
    });
});

// หน้า backup (ซ่อนอยู่)
app.get('/backup', basicAuth, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.download(path.join(__dirname, 'public', 'shop.db'));
});

app.get('/secrets', (req, res) => {
    res.send('Backup access: notatord: ghjkl;');
});

app.get('/redroom', (req, res) => {
    res.render('redroom');
});

// 404 สำหรับหน้าไม่พบ
app.use((req, res) => {
    res.status(404).render('404');
});



function getLocalExternalIPv4() {
    const interfaces = os.networkInterfaces();
    for (const ifaceArr of Object.values(interfaces)) {
        for (const iface of ifaceArr) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

app.listen(port, '0.0.0.0', () => {
    const address = getLocalExternalIPv4();
    console.log(`Server running at http://${address}:${port}`);
});