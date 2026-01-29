const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "server/bank.db");
const db = new sqlite3.Database(dbPath);

const email = "lorinewoop@gmail.com";

db.serialize(() => {
  db.get(
    "SELECT id, name, email FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!user) {
        console.log(`User ${email} not found`);
        return;
      }
      console.log("User found:", user);

      db.all(
        "SELECT * FROM withdrawal_methods WHERE userId = ?",
        [user.id],
        (err, rows) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`Withdrawal methods for ${user.id}:`, rows);
        },
      );
    },
  );
});
