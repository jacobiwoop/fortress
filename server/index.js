const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use("/uploads", express.static(uploadDir));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../dist")));

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateCardNumber = () => {
  let num = "";
  for (let i = 0; i < 4; i++) {
    num += Math.floor(1000 + Math.random() * 9000).toString();
    if (i < 3) num += " ";
  }
  return num;
};

const generateCVV = () => Math.floor(100 + Math.random() * 900).toString();

const fetchFullUser = (userId, callback) => {
  const response = {
    user: null,
    transactions: [],
    notifications: [],
    beneficiaries: [],
  };

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) return callback(err);
    if (!user) return callback(null, null);

    response.user = user;

    db.all(
      "SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC",
      [userId],
      (err, txs) => {
        if (err) return callback(err);
        response.transactions = txs;

        db.all(
          "SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC",
          [userId],
          (err, notifs) => {
            if (err) return callback(err);
            response.notifications = notifs.map((n) => ({
              ...n,
              read: !!n.read,
            }));

            db.all(
              "SELECT * FROM beneficiaries WHERE userId = ?",
              [userId],
              (err, bens) => {
                if (err) return callback(err);
                response.beneficiaries = bens;

                const fullUser = {
                  ...response.user,
                  transactions: response.transactions,
                  notifications: response.notifications,
                  beneficiaries: response.beneficiaries,
                };
                callback(null, fullUser);
              }
            );
          }
        );
      }
    );
  });
};

// --- ROUTES ---

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT id FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: "Invalid credentials" });

      // Fetch full details
      fetchFullUser(row.id, (err, fullUser) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(fullUser);
      });
    }
  );
});

// Get All Users (Admin)
// Note: For now we return basic user info + empty arrays to prevent frontend crashes
// Ideally we would fetch full info or frontend should handle missing arrays
app.get("/api/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const safeRows = rows.map((u) => ({
      ...u,
      transactions: [],
      notifications: [],
      beneficiaries: [],
    }));
    res.json(safeRows);
  });
});

// Get Single User (with related data)
app.get("/api/users/:id", (req, res) => {
  fetchFullUser(req.params.id, (err, fullUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!fullUser) return res.status(404).json({ error: "User not found" });
    res.json(fullUser);
  });
});

// Create User (Admin)
app.post("/api/users", (req, res) => {
  const { name, email, password, role, balance, iban } = req.body;
  const id = generateId();
  const status = "ACTIVE";
  const cardNumber = generateCardNumber();
  const cvv = generateCVV();

  const stmt = db.prepare(
    "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  stmt.run(
    id,
    name,
    email,
    password,
    role,
    balance,
    status,
    iban,
    cardNumber,
    cvv,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const newUser = {
        id,
        name,
        email,
        role,
        balance,
        status,
        iban,
        cardNumber,
        cvv,
        transactions: [],
        notifications: [],
        beneficiaries: [],
      };
      res.status(201).json(newUser);
    }
  );
  stmt.finalize();
});

// Create Transaction (Transfer, Payment, etc.)
app.post("/api/transactions", (req, res) => {
  const { userId, amount, type, description, counterparty } = req.body;
  const id = generateId();
  const date = new Date().toISOString();

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Update Balance
    db.run(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [amount, userId],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
      }
    );

    // Insert Transaction
    const stmt = db.prepare(
      "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      id,
      userId,
      amount,
      type,
      date,
      description,
      counterparty,
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        db.run("COMMIT");
        res
          .status(201)
          .json({ id, userId, amount, type, date, description, counterparty });
      }
    );
    stmt.finalize();
  });
});

// Update Status
app.patch("/api/users/:id/status", (req, res) => {
  const { status } = req.body;
  db.run(
    "UPDATE users SET status = ? WHERE id = ?",
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- LOANS ---

// Get All Loans (or for user)
app.get("/api/loans", (req, res) => {
  db.all("SELECT * FROM loans ORDER BY requestDate DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Request Loan
app.post("/api/loans", (req, res) => {
  const { userId, userName, amount, purpose } = req.body;
  const id = generateId();
  const status = "PENDING";
  const requestDate = new Date().toISOString();

  const stmt = db.prepare("INSERT INTO loans VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(
    id,
    userId,
    userName,
    amount,
    purpose,
    status,
    requestDate,
    null,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ id, userId, userName, amount, purpose, status, requestDate });
    }
  );
  stmt.finalize();
});

// Process Loan (Approve/Reject)
app.patch("/api/loans/:id", (req, res) => {
  const { status, adminReason } = req.body; // status: APPROVED | REJECTED
  db.run(
    "UPDATE loans SET status = ?, adminReason = ? WHERE id = ?",
    [status, adminReason, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- BENEFICIARIES ---

app.post("/api/beneficiaries", (req, res) => {
  const { userId, name, accountNumber, bankName } = req.body;
  const id = generateId();

  const stmt = db.prepare("INSERT INTO beneficiaries VALUES (?, ?, ?, ?, ?)");
  stmt.run(id, userId, name, accountNumber, bankName, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, userId, name, accountNumber, bankName });
  });
  stmt.finalize();
});

// --- NOTIFICATIONS ---

app.post("/api/notifications", (req, res) => {
  const { userId, title, message, type } = req.body;
  const id = generateId();
  const date = new Date().toISOString();

  const stmt = db.prepare(
    "INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  stmt.run(id, userId, title, message, date, 0, type, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id });
  });
  stmt.finalize();
});

// --- SETTINGS ---

app.get("/api/settings", (req, res) => {
  db.get("SELECT * FROM site_config WHERE id = 1", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post("/api/settings", (req, res) => {
  const { name, logoText, logoUrl } = req.body;
  db.run(
    "UPDATE site_config SET name = ?, logoText = ?, logoUrl = ? WHERE id = 1",
    [name, logoText, logoUrl],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post("/api/upload", upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// SPA Fallback: Serve index.html for any unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
