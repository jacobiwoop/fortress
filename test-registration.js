#!/usr/bin/env node

/**
 * Test script for user registration with financial institution selection
 * Tests the complete registration flow including bank selection
 */

const API_URL = "http://localhost:3001/api";

const testUsers = [
  {
    name: "Test User TD",
    email: "test.td@example.com",
    password: "password123",
    dateOfBirth: "1990-01-15",
    address: "123 Test Street, Montreal",
    financialInstitution: "TD Bank",
  },
  {
    name: "Test User Desjardins",
    email: "test.desjardins@example.com",
    password: "password123",
    dateOfBirth: "1985-06-20",
    address: "456 Test Avenue, Quebec",
    financialInstitution: "Desjardins",
  },
  {
    name: "Test User BNC",
    email: "test.bnc@example.com",
    password: "password123",
    dateOfBirth: "1992-03-10",
    address: "789 Test Road, Ottawa",
    financialInstitution: "BNC",
  },
];

async function testRegistration(userData) {
  console.log(`\n🧪 Testing registration for: ${userData.name}`);
  console.log(`   Bank: ${userData.financialInstitution}`);

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`   ❌ Registration failed: ${error.error}`);
      return false;
    }

    const user = await response.json();
    console.log(`   ✅ Registration successful!`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🏦 Bank: ${user.financialInstitution}`);
    console.log(`   💳 Card: ${user.cardNumber}`);
    console.log(`   🆔 IBAN: ${user.iban}`);

    // Verify the financial institution was saved correctly
    if (user.financialInstitution === userData.financialInstitution) {
      console.log(`   ✅ Financial institution saved correctly`);
    } else {
      console.log(`   ❌ Financial institution mismatch!`);
      console.log(`      Expected: ${userData.financialInstitution}`);
      console.log(`      Got: ${user.financialInstitution}`);
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testLogin(email, password) {
  console.log(`\n🔐 Testing login for: ${email}`);

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.log(`   ❌ Login failed`);
      return false;
    }

    const user = await response.json();
    console.log(`   ✅ Login successful!`);
    console.log(`   👤 Name: ${user.name}`);
    console.log(`   🏦 Bank: ${user.financialInstitution}`);

    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Registration Tests");
  console.log("================================\n");

  let successCount = 0;
  let failCount = 0;

  // Test registrations
  for (const userData of testUsers) {
    const success = await testRegistration(userData);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Test login for first user
  if (testUsers.length > 0) {
    await testLogin(testUsers[0].email, testUsers[0].password);
  }

  // Summary
  console.log("\n================================");
  console.log("📊 Test Summary");
  console.log("================================");
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${testUsers.length}`);

  if (failCount === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above.");
  }
}

// Run tests
runTests().catch(console.error);
