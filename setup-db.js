    const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

function createMD5Hash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

const db = new sqlite3.Database(path.join(__dirname, 'public', 'shop.db'));

db.serialize(() => {
    // ลบตารางทั้งหมดก่อนสร้างใหม่
    db.run("DROP TABLE IF EXISTS products");
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS encoded_key");

    // สร้างตาราง products
    db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, image_url TEXT)");
    db.run("INSERT INTO products (id, name, price, image_url) VALUES " +
           "(1, 'Free Wig', 1000, '/images/real_wig.jpg'), " +
           "(2, 'Phone', 500, '/images/second_hand_phone.jpg'), " +
           "(3, 'Stone', 300, '/images/cat_palm.png'), " +
           "(4, 'Toy', 100, '/images/gun.jpg'), " +
           "(5, 'Steak', 50, '/images/family_meat.png'), " +
           "(6, 'Cute Hello Kitty', 666, '/images/spy_cam.gif'), " +
           "(7, 'Concert Ticket', 200, '/images/license.png')");

    // สร้างตาราง users (เฉพาะ admin)
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', createMD5Hash('madison')]);

    // สร้างตาราง chat sessions สำหรับ AI support challenge
    db.run("DROP TABLE IF EXISTS chat_sessions");
    db.run("CREATE TABLE chat_sessions (session_id TEXT PRIMARY KEY, tier TEXT DEFAULT 'member')");

    // สร้างตาราง reviews
    db.run("DROP TABLE IF EXISTS reviews");
    db.run("CREATE TABLE reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, reviewer TEXT, body TEXT, created_at TEXT DEFAULT (datetime('now')))");
    const reviewStmt = db.prepare("INSERT INTO reviews (product_id, reviewer, body) VALUES (?, ?, ?)");
    reviewStmt.run(1, 'Anna K.', 'Looks surprisingly natural. Nobody at the party noticed it was fake.');
    reviewStmt.run(1, 'Mike T.', 'Great quality for the price. Shipping was fast too.');
    reviewStmt.run(2, 'Dave R.', 'Battery life is way better than expected for a used phone. Minor scratches but nothing major.');
    reviewStmt.run(2, 'Lisa M.', 'Works perfectly. Previous owner left some interesting photos on it though...');
    reviewStmt.run(3, 'Ben W.', "It's a rock. Does exactly what a rock is supposed to do. Five stars.");
    reviewStmt.run(5, 'Chris L.', "Don't ask where it came from. Just eat it. Genuinely delicious.");
    reviewStmt.run(6, 'Sara J.', 'Adorable design. I put it on my shelf and now I feel like something is always watching me. 10/10.');
    reviewStmt.run(7, 'Tom H.', 'The band never showed up but the ticket stub looks cool framed on my wall.');
    reviewStmt.finalize();
});

db.close();