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
        status TEXT,
        date TEXT,
        description TEXT,
        counterparty TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

  // Migration: Add status column if it doesn't exist
  db.run("ALTER TABLE transactions ADD COLUMN status TEXT", (err) => {
    // Ignore error if column already exists (sqlite doesn't support IF NOT EXISTS for columns easily)
  });

  // Migration: Add adminReason column if it doesn't exist
  db.run("ALTER TABLE transactions ADD COLUMN adminReason TEXT", (err) => {
    // Ignore error if column already exists
  });

  // Create document_requests table
  db.run(`CREATE TABLE IF NOT EXISTS document_requests (
      id TEXT PRIMARY KEY,
      userId TEXT,
      requestedBy TEXT,
      documentType TEXT,
      description TEXT,
      status TEXT,
      requestDate TEXT,
      submittedDate TEXT,
      fileName TEXT,
      fileSize TEXT,
      adminReason TEXT,
      notificationType TEXT,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(requestedBy) REFERENCES users(id)
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

  // Seed Default User (Jean Dupont) if not exists
  db.get("SELECT id FROM users WHERE id = 'u1'", [], (err, row) => {
    if (!row) {
      const stmt = db.prepare(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      stmt.run(
        "u1",
        "Jean Dupont",
        "user@bank.com",
        "password",
        "USER",
        12500.5,
        "ACTIVE",
        "FR76 3000 4000 5000 6000 7000 12",
        "4242 4242 4242 4242",
        "123"
      );
      stmt.finalize();

      // Seed some initial transactions for Jean
      const date = new Date().toISOString();
      db.run(
        "INSERT INTO transactions (id, userId, amount, type, status, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["t_init_1", "u1", 2500, "DEPOSIT", "COMPLETED", date, "Solde Initial"]
      );

      console.log("Seeded User (Jean Dupont).");
    }
  });
});

module.exports = db;
