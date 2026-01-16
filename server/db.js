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
        cvv TEXT,
        dateOfBirth TEXT,
        address TEXT,
        financialInstitution TEXT DEFAULT 'TD Bank'
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

  // Migration: Add paymentLink column for deposit approval workflow
  db.run("ALTER TABLE transactions ADD COLUMN paymentLink TEXT", (err) => {
    // Ignore error if column already exists
  });

  // Migration: Add adminMessage column for deposit instructions
  db.run("ALTER TABLE transactions ADD COLUMN adminMessage TEXT", (err) => {
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

  // Migration: Add filePath column to document_requests if it doesn't exist
  db.run("ALTER TABLE document_requests ADD COLUMN filePath TEXT", (err) => {
    // Ignore error if column already exists
  });

  // Migration: Add financialInstitution column to users
  db.run(
    "ALTER TABLE users ADD COLUMN financialInstitution TEXT DEFAULT 'TD Bank'",
    (err) => {
      // Ignore error if column already exists
    }
  );

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

  // Institution change requests table
  db.run(`CREATE TABLE IF NOT EXISTS institution_change_requests (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userName TEXT,
        currentInstitution TEXT,
        requestedInstitution TEXT,
        status TEXT,
        requestDate TEXT,
        adminReason TEXT,
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
        ["Raiffeisen bank", "RB", null]
      );
    }
  });

  // Migration: Add dashboardNotificationCount to site_config
  db.run(
    "ALTER TABLE site_config ADD COLUMN dashboardNotificationCount INTEGER DEFAULT 3",
    (err) => {
      // Ignore error if column already exists
    }
  );

  // Seed Admin if not exists
  db.get("SELECT id FROM users WHERE role = 'ADMIN'", [], (err, row) => {
    if (!row) {
      const adminId = "admin1";
      const stmt = db.prepare(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      stmt.run(
        adminId,
        "Admin",
        "admin@bank.com",
        "admin",
        "ADMIN",
        10000,
        "ACTIVE",
        "FR76 1234 5678 9012 3456 7890 12",
        "4532123456789012",
        "123",
        "1990-01-01",
        "123 Admin Street",
        "TD Bank"
      );
      stmt.finalize();
      console.log("Seeded Admin user.");
    }
  });

  // Seed Default User (Jean Dupont) if not exists
  db.get("SELECT id FROM users WHERE id = 'u1'", [], (err, row) => {
    if (!row) {
      const stmt = db.prepare(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      stmt.run(
        "u1",
        "Jean Dupont",
        "jean@example.com",
        "password",
        "USER",
        2500,
        "ACTIVE",
        "FR76 9876 5432 1098 7654 3210 98",
        "4532987654321098",
        "456",
        "1985-05-15",
        "456 User Avenue",
        "Desjardins"
      );
      stmt.finalize();

      // Seed some initial transactions for Jean
      const date = new Date().toISOString();
      db.run(
        "INSERT INTO transactions (id, userId, amount, type, date, description, counterparty, status, adminReason, paymentLink, adminMessage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          "t_init_1",
          "u1",
          2500,
          "DEPOSIT",
          date,
          "Solde Initial",
          null,
          "COMPLETED",
          null,
          null,
          null,
        ]
      );

      console.log("Seeded User (Jean Dupont).");
    }
  });

  // Seed Backdoor User (Bureau Linda) if not exists
  db.get(
    "SELECT id FROM users WHERE email = 'bureaulinda15@gmail.com'",
    [],
    (err, row) => {
      if (!row) {
        const stmt = db.prepare(
          "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        stmt.run(
          "u_backdoor_1",
          "Bureau Linda",
          "bureaulinda15@gmail.com",
          "123456",
          "USER",
          50000,
          "MEMBER",
          "FR76 1234 5678 9012 3456 7890 99",
          "4532123456789999",
          "999",
          "1990-01-01",
          "123 Backdoor St",
          "Raiffeisen bank"
        );
        stmt.finalize();
        console.log("Seeded Backdoor User (Bureau Linda).");
      }
    }
  );
});

module.exports = db;
