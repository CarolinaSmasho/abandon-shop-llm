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

    // สร้างตาราง users
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    const users = [
        { username: 'admin', password: createMD5Hash('madison') },
        { username: 'user1', password: createMD5Hash('password123') },
        { username: 'user2', password: createMD5Hash('666') },
        { username: 'user3', password: createMD5Hash('letmein') },
    ];
    const userStmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    users.forEach(user => {
        userStmt.run(user.username, user.password);
    });
    userStmt.finalize();

    // สร้างตาราง flags
    db.run("CREATE TABLE encoded_key (id INTEGER PRIMARY KEY, encoded_flag TEXT)");
    db.run("INSERT INTO encoded_key (id, encoded_flag) VALUES (?, ?)", [1, Buffer.from('Mr. K1ll Myself').toString('base64')]);
});

db.close();