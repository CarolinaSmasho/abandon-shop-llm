const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// ฟังก์ชันสร้างแฮช MD5
function createMD5Hash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

const db = new sqlite3.Database(path.join(__dirname, 'public', 'shop.db'));

db.serialize(() => {
    // สร้างตาราง products
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, image_url TEXT)");
    db.run("INSERT OR IGNORE INTO products (id, name, price, image_url) VALUES " +
           "(1, 'Free Wig', 1000, '/images/real_wig.jpg'), " +
           "(2, 'Phone', 500, '/images/second_hand_phone.jpg'), " +
           "(3, 'Stone', 300, '/images/cat_palm.png'), " +
           "(4, 'Toy', 100, '/images/gun.jpg'), " +
           "(5, 'Steak', 50, '/images/family_meat.png'), " +
           "(6, 'Concert Ticket', 200, '/images/license.png')");

    // สร้างตาราง users
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)");
    
    
    // เพิ่มผู้ใช้พร้อมรหัสผ่านที่แฮชด้วย MD5
    const users = [
        { username: 'admin', password: createMD5Hash('asdf_nong_tord') },
        { username: 'user1', password: createMD5Hash('password123') },
        { username: 'user2', password: createMD5Hash('qwerty') },
        { username: 'user3', password: createMD5Hash('letmein') }
    ];
    const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)");
    users.forEach(user => {
        stmt.run(user.username, user.password);
    });
    stmt.finalize();
});

db.close();