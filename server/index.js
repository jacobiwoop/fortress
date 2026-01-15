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

// Register
app.post("/api/register", (req, res) => {
  const { name, email, password, dateOfBirth, address } = req.body;

  // Check if email already exists
  db.get("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const id = generateId();
    const role = "USER";
    const balance = 0;
    const status = "ACTIVE";
    const iban =
      "FR76 " +
      Math.floor(Math.random() * 1e12)
        .toString()
        .padStart(12, "0") +
      " " +
      Math.floor(Math.random() * 1e12)
        .toString()
        .padStart(12, "0");
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

        // Fetch the newly created user with all related data
        fetchFullUser(id, (err, fullUser) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(fullUser);
        });
      }
    );
    stmt.finalize();
  });
});

// Get All Users (Admin)
app.get("/api/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });

    // Fetch all transactions to attach
    db.all("SELECT * FROM transactions ORDER BY date DESC", [], (err, txs) => {
      if (err) return res.status(500).json({ error: err.message });

      const usersWithTxs = users.map((u) => ({
        ...u,
        transactions: txs.filter((t) => t.userId === u.id),
        notifications: [], // Could fetch these too if needed
        beneficiaries: [],
      }));

      res.json(usersWithTxs);
    });
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

// Set exact balance (admin only)
app.patch("/api/users/:id/set-balance", (req, res) => {
  const { balance } = req.body;

  db.run(
    "UPDATE users SET balance = ? WHERE id = ?",
    [balance, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get updated user
      db.get(
        "SELECT * FROM users WHERE id = ?",
        [req.params.id],
        (err, user) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(user);
        }
      );
    }
  );
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
  const { userId, amount, type, status, description, counterparty } = req.body;
  const id = generateId();
  const date = new Date().toISOString();
  // All transactions start as PENDING and require admin approval
  const txStatus = "PENDING";

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Update Balance - ONLY if status is COMPLETED or PENDING (Funds are reserved/deducted in both cases for this logic)
    // If pending, we deduct. If rejected later, we refund.
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
      "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      id,
      userId,
      amount,
      type,
      date, // ✅ date before status
      description,
      counterparty,
      txStatus, // ✅ status after counterparty
      null, // adminReason - initially null
      null, // paymentLink - initially null
      null, // adminMessage - initially null
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        db.run("COMMIT");
        res.status(201).json({
          id,
          userId,
          amount,
          type,
          status: txStatus,
          date,
          description,
          counterparty,
        });
      }
    );
    stmt.finalize();
  });
});

// Update Transaction (Approve/Reject)
app.patch("/api/transactions/:id", (req, res) => {
  const { status, adminReason } = req.body; // COMPLETED | REJECTED, and optional reason
  const { id } = req.params;

  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, tx) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    if (status === "REJECTED" && tx.status === "PENDING") {
      // Refund logic
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        // Subtract amount (which is negative for withdrawals/transfers, so this adds it back)
        db.run("UPDATE users SET balance = balance - ? WHERE id = ?", [
          tx.amount,
          tx.userId,
        ]);
        db.run(
          "UPDATE transactions SET status = ?, adminReason = ? WHERE id = ?",
          [status, adminReason || null, id]
        );
        db.run("COMMIT", (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, refunded: true });
        });
      });
    } else {
      // Just update status (e.g. PENDING -> COMPLETED)
      db.run(
        "UPDATE transactions SET status = ?, adminReason = ? WHERE id = ?",
        [status, adminReason || null, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  });
});

// Send payment instructions for deposit (admin)
app.patch("/api/transactions/:id/payment-instructions", (req, res) => {
  const { paymentLink, adminMessage } = req.body;
  const { id } = req.params;

  // Get transaction details
  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, tx) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    // Update transaction with payment link and message
    db.run(
      "UPDATE transactions SET paymentLink = ?, adminMessage = ? WHERE id = ?",
      [paymentLink, adminMessage, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Send notification to user
        const notifId = generateId();
        const notifTitle = `Deposit Request - Payment Instructions`;
        const notifMessage = `${adminMessage}\n\nAmount: ${tx.amount}€\nPayment Link: ${paymentLink}`;

        db.run(
          "INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            notifId,
            tx.userId,
            notifTitle,
            notifMessage,
            new Date().toISOString(),
            0,
            "alert",
          ],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          }
        );
      }
    );
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

// Get User Notifications
app.get("/api/notifications/:userId", (req, res) => {
  db.all(
    "SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const notifications = rows.map((n) => ({ ...n, read: !!n.read }));
      res.json(notifications);
    }
  );
});

// Mark notification as read
app.patch("/api/notifications/:id/read", (req, res) => {
  db.run(
    "UPDATE notifications SET read = 1 WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- DOCUMENT REQUESTS ---

// Create document request
app.post("/api/document-requests", (req, res) => {
  const { userId, documentType, description, requestedBy, notificationType } =
    req.body;
  const id = generateId();
  const status = "PENDING";
  const requestDate = new Date().toISOString();

  db.run(
    "INSERT INTO document_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      userId,
      requestedBy,
      documentType,
      description,
      status,
      requestDate,
      null, // submittedDate
      null, // fileName
      null, // fileSize
      null, // adminReason
      notificationType || "info",
      null, // filePath
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Send notification to user
      const notifId = generateId();
      const notifType = notificationType || "info";
      db.run(
        "INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          notifId,
          userId,
          "Document Required",
          `Please submit: ${documentType}. ${description}`,
          requestDate,
          0,
          notifType,
        ],
        () => {
          res.status(201).json({ id });
        }
      );
    }
  );
});

// Get all document requests (admin)
app.get("/api/document-requests", (req, res) => {
  db.all(
    `SELECT dr.*, u.name as userName 
     FROM document_requests dr 
     JOIN users u ON dr.userId = u.id 
     ORDER BY requestDate DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get document requests for a user
app.get("/api/document-requests/user/:userId", (req, res) => {
  db.all(
    "SELECT * FROM document_requests WHERE userId = ? ORDER BY requestDate DESC",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Submit document (user uploads metadata)
// Submit document (user uploads file)
app.patch(
  "/api/document-requests/:id/submit",
  upload.single("document"),
  (req, res) => {
    const submittedDate = new Date().toISOString();

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = req.file.originalname;
    const fileSize = `${(req.file.size / 1024).toFixed(2)} KB`;
    const filePath = `/uploads/${req.file.filename}`;

    db.run(
      "UPDATE document_requests SET status = 'SUBMITTED', submittedDate = ?, fileName = ?, fileSize = ?, filePath = ? WHERE id = ?",
      [submittedDate, fileName, fileSize, filePath, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, filePath });
      }
    );
  }
);

// Review document (approve/reject)
app.patch("/api/document-requests/:id/review", (req, res) => {
  const { status, adminReason } = req.body; // APPROVED | REJECTED

  db.get(
    "SELECT * FROM document_requests WHERE id = ?",
    [req.params.id],
    (err, docReq) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!docReq)
        return res.status(404).json({ error: "Document request not found" });

      db.run(
        "UPDATE document_requests SET status = ?, adminReason = ? WHERE id = ?",
        [status, adminReason || null, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Send notification to user about the decision
          const notifId = generateId();
          const title =
            status === "APPROVED" ? "Document Approved" : "Document Rejected";
          const message =
            status === "APPROVED"
              ? `Your ${docReq.documentType} has been approved.`
              : `Your ${docReq.documentType} was rejected. Reason: ${
                  adminReason || "No reason provided"
                }`;

          db.run(
            "INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              notifId,
              docReq.userId,
              title,
              message,
              new Date().toISOString(),
              0,
              "info",
            ],
            () => {
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

// --- SETTINGS ---

app.get("/api/settings", (req, res) => {
  db.get("SELECT * FROM site_config WHERE id = 1", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post("/api/settings", (req, res) => {
  const { name, logoText, logoUrl, dashboardNotificationCount } = req.body;

  db.run(
    "UPDATE site_config SET name = ?, logoText = ?, logoUrl = ?, dashboardNotificationCount = ? WHERE id = 1",
    [name, logoText, logoUrl, dashboardNotificationCount || 3],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM site_config WHERE id = 1", [], (err, config) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(config);
      });
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
