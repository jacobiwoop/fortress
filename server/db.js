const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "bank.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        balance REAL,
        status TEXT,
        iban TEXT,
        cardNumber TEXT,
        cvv TEXT
    )`);

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        amount REAL,
        type TEXT,
        date TEXT,
        description TEXT,
        counterparty TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        message TEXT,
        date TEXT,
        read INTEGER,
        type TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

  // Beneficiaries table
  db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
        id TEXT PRIMARY KEY,
        userId TEXT,
        name TEXT,
        accountNumber TEXT,
        bankName TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

  // Loans table
  db.run(`CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userName TEXT,
        amount REAL,
        purpose TEXT,
        status TEXT,
        requestDate TEXT,
        adminReason TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

  // Site Config table
  db.run(`CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        logoText TEXT,
        logoUrl TEXT
    )`);

  // Seed default config
  db.get("SELECT id FROM site_config WHERE id = 1", [], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO site_config (id, name, logoText, logoUrl) VALUES (1, ?, ?, ?)",
        ["Fortress Bank", "FB", null]
      );
    }
  });

  // Seed Admin if not exists
  db.get("SELECT id FROM users WHERE role = 'ADMIN'", [], (err, row) => {
    if (!row) {
      const adminId = "a1";
      const stmt = db.prepare(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      stmt.run(
        adminId,
        "Admin System",
        "admin@bank.com",
        "admin",
        "ADMIN",
        0,
        "ACTIVE",
        "",
        "",
        ""
      );
      stmt.finalize();
      console.log("Seeded Admin user.");
    }
  });
});

module.exports = db;
