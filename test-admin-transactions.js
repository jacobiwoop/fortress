/**
 * Script de test pour vérifier que les virements et retraits apparaissent dans le panneau admin
 *
 * Ce script va :
 * 1. Créer un utilisateur de test
 * 2. Se connecter en tant qu'utilisateur
 * 3. Créer un virement (TRANSFER_OUT)
 * 4. Créer un retrait (WITHDRAWAL)
 * 5. Se connecter en tant qu'admin
 * 6. Vérifier que les transactions apparaissent dans /api/users
 * 7. Afficher les résultats
 */

const API_URL = "http://localhost:3001/api";

// Couleurs pour la console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60));
}

async function makeRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    log(`❌ Erreur sur ${endpoint}: ${error.message}`, "red");
    throw error;
  }
}

async function runTest() {
  let testUserId = null;
  let transferTxId = null;
  let withdrawalTxId = null;

  try {
    // ===== ÉTAPE 1: Créer un utilisateur de test =====
    logSection("ÉTAPE 1: Création d'un utilisateur de test");

    const testEmail = `test-${Date.now()}@bank.com`;
    const testUser = await makeRequest("/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: "test123",
        dateOfBirth: "1990-01-01",
        address: "123 Test Street",
        financialInstitution: "TD Bank",
      }),
    });

    testUserId = testUser.id;
    log(`✓ Utilisateur créé: ${testUser.name} (ID: ${testUserId})`, "green");
    log(`  Email: ${testEmail}`, "blue");
    log(`  Balance initiale: ${testUser.balance}€`, "blue");

    // ===== ÉTAPE 2: Créer un virement =====
    logSection("ÉTAPE 2: Création d'un virement (TRANSFER_OUT)");

    const transferData = {
      userId: testUserId,
      amount: -100,
      type: "TRANSFER_OUT",
      description: "Test Transfer",
      counterparty: "John Doe",
      date: new Date().toISOString(),
    };

    const transfer = await makeRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(transferData),
    });

    transferTxId = transfer.id;
    log(`✓ Virement créé: ${transfer.description}`, "green");
    log(`  ID: ${transferTxId}`, "blue");
    log(`  Montant: ${transfer.amount}€`, "blue");
    log(`  Status: ${transfer.status}`, "yellow");
    log(`  Type: ${transfer.type}`, "blue");

    // ===== ÉTAPE 3: Créer un retrait =====
    logSection("ÉTAPE 3: Création d'un retrait (WITHDRAWAL)");

    const withdrawalData = {
      userId: testUserId,
      amount: -50,
      type: "WITHDRAWAL",
      description: "Test ATM Withdrawal",
      date: new Date().toISOString(),
    };

    const withdrawal = await makeRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(withdrawalData),
    });

    withdrawalTxId = withdrawal.id;
    log(`✓ Retrait créé: ${withdrawal.description}`, "green");
    log(`  ID: ${withdrawalTxId}`, "blue");
    log(`  Montant: ${withdrawal.amount}€`, "blue");
    log(`  Status: ${withdrawal.status}`, "yellow");
    log(`  Type: ${withdrawal.type}`, "blue");

    // ===== ÉTAPE 4: Se connecter en tant qu'admin =====
    logSection("ÉTAPE 4: Connexion en tant qu'admin");

    const adminLogin = await makeRequest("/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@bank.com",
        password: "admin",
      }),
    });

    log(`✓ Admin connecté: ${adminLogin.name}`, "green");

    // ===== ÉTAPE 5: Récupérer tous les utilisateurs (vue admin) =====
    logSection("ÉTAPE 5: Récupération de tous les utilisateurs (vue admin)");

    const allUsers = await makeRequest("/users");
    log(`✓ ${allUsers.length} utilisateurs récupérés`, "green");

    // ===== ÉTAPE 6: Vérifier que notre utilisateur de test est présent =====
    logSection("ÉTAPE 6: Vérification de l'utilisateur de test");

    const foundUser = allUsers.find((u) => u.id === testUserId);

    if (!foundUser) {
      log(
        `❌ ÉCHEC: Utilisateur de test non trouvé dans la liste admin!`,
        "red"
      );
      return;
    }

    log(`✓ Utilisateur trouvé: ${foundUser.name}`, "green");
    log(`  Nombre de transactions: ${foundUser.transactions.length}`, "blue");

    // ===== ÉTAPE 7: Vérifier les transactions =====
    logSection("ÉTAPE 7: Vérification des transactions");

    const foundTransfer = foundUser.transactions.find(
      (t) => t.id === transferTxId
    );
    const foundWithdrawal = foundUser.transactions.find(
      (t) => t.id === withdrawalTxId
    );

    console.log("\nTransactions de l'utilisateur:");
    foundUser.transactions.forEach((tx, index) => {
      const statusColor = tx.status === "PENDING" ? "yellow" : "green";
      log(
        `  ${index + 1}. [${tx.type}] ${tx.description} - ${tx.amount}€ (${
          tx.status
        })`,
        statusColor
      );
    });

    // Vérification du virement
    console.log("\n--- Vérification du VIREMENT ---");
    if (foundTransfer) {
      log(`✓ Virement trouvé dans les transactions de l'utilisateur`, "green");
      log(
        `  Status: ${foundTransfer.status}`,
        foundTransfer.status === "PENDING" ? "yellow" : "green"
      );
      log(`  Type: ${foundTransfer.type}`, "blue");
      log(`  Montant: ${foundTransfer.amount}€`, "blue");
    } else {
      log(`❌ ÉCHEC: Virement NON trouvé!`, "red");
    }

    // Vérification du retrait
    console.log("\n--- Vérification du RETRAIT ---");
    if (foundWithdrawal) {
      log(`✓ Retrait trouvé dans les transactions de l'utilisateur`, "green");
      log(
        `  Status: ${foundWithdrawal.status}`,
        foundWithdrawal.status === "PENDING" ? "yellow" : "green"
      );
      log(`  Type: ${foundWithdrawal.type}`, "blue");
      log(`  Montant: ${foundWithdrawal.amount}€`, "blue");
    } else {
      log(`❌ ÉCHEC: Retrait NON trouvé!`, "red");
    }

    // ===== ÉTAPE 8: Compter les transactions en attente =====
    logSection("ÉTAPE 8: Comptage des transactions PENDING");

    let totalPending = 0;
    let pendingTransfers = 0;
    let pendingWithdrawals = 0;
    let pendingDeposits = 0;

    allUsers.forEach((user) => {
      user.transactions.forEach((tx) => {
        if (tx.status === "PENDING") {
          totalPending++;
          if (tx.type === "TRANSFER_OUT" || tx.type === "TRANSFER") {
            pendingTransfers++;
          } else if (tx.type === "WITHDRAWAL") {
            pendingWithdrawals++;
          } else if (tx.type === "DEPOSIT") {
            pendingDeposits++;
          }
        }
      });
    });

    log(`Total de transactions PENDING: ${totalPending}`, "yellow");
    log(`  - Virements: ${pendingTransfers}`, "blue");
    log(`  - Retraits: ${pendingWithdrawals}`, "blue");
    log(`  - Dépôts: ${pendingDeposits}`, "blue");

    // ===== RÉSULTAT FINAL =====
    logSection("RÉSULTAT FINAL");

    const success =
      foundTransfer &&
      foundWithdrawal &&
      foundTransfer.status === "PENDING" &&
      foundWithdrawal.status === "PENDING";

    if (success) {
      log(
        "✓ TEST RÉUSSI: Les virements et retraits apparaissent correctement!",
        "green"
      );
      log(
        "  Les transactions sont bien créées avec le status PENDING",
        "green"
      );
      log("  Les transactions sont bien présentes dans /api/users", "green");
    } else {
      log("❌ TEST ÉCHOUÉ: Problème détecté!", "red");
      if (!foundTransfer) log("  - Le virement n'apparaît pas", "red");
      if (!foundWithdrawal) log("  - Le retrait n'apparaît pas", "red");
    }

    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    logSection("ERREUR");
    log(`Test interrompu: ${error.message}`, "red");
    console.error(error);
  }
}

// Exécuter le test
log("Démarrage du test...", "cyan");
log(
  "Assurez-vous que le serveur est en cours d'exécution sur http://localhost:3001\n",
  "yellow"
);

runTest().catch((error) => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});
