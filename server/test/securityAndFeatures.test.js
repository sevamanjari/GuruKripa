/**
 * GuruKripa Yatayat Security & Feature Test Suite
 * Tests:
 * 1. Public Health Check
 * 2. Unauthenticated 401 Access Barriers
 * 3. Tampered Token 403 Rejection
 * 4. Authentication Login (Valid & Invalid Credentials)
 * 5. Security Headers (Clickjacking, MIME Sniffing, Referrer)
 * 6. Authenticated Customer CRUD & Input Sanitization
 * 7. Authenticated Insurance Issue & Renewal History Archiving
 */

const BASE_URL = "http://localhost:5000";

let testPassCount = 0;
let testFailCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testPassCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testFailCount++;
  }
}

async function runTestSuite() {
  console.log("==========================================================");
  console.log("🔒 GURUKRIPA SECURITY & FEATURE AUTOMATED TEST SUITE");
  console.log("==========================================================");

  let authToken = null;
  let testCustomerId = null;
  let testInsuranceId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Public Health Check
    // ----------------------------------------------------
    console.log("\n[1] Testing Public Endpoints:");
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, "GET /api/health returned HTTP 200");
    assert(healthData.status === "ok", "Health payload status is 'ok'");

    // ----------------------------------------------------
    // TEST 2: Security Barrier on Unauthenticated Requests
    // ----------------------------------------------------
    console.log("\n[2] Testing Auth Barrier (Without Token):");
    const noAuthCustomers = await fetch(`${BASE_URL}/api/customers`);
    assert(
      noAuthCustomers.status === 401,
      `GET /api/customers without token blocked with HTTP 401 (got ${noAuthCustomers.status})`
    );

    const noAuthInsurance = await fetch(`${BASE_URL}/api/insurances`);
    assert(
      noAuthInsurance.status === 401,
      `GET /api/insurances without token blocked with HTTP 401 (got ${noAuthInsurance.status})`
    );

    const noAuthPermits = await fetch(`${BASE_URL}/api/permits`);
    assert(
      noAuthPermits.status === 401,
      `GET /api/permits without token blocked with HTTP 401 (got ${noAuthPermits.status})`
    );

    const noAuthStats = await fetch(`${BASE_URL}/api/dashboard/stats`);
    assert(
      noAuthStats.status === 401,
      `GET /api/dashboard/stats without token blocked with HTTP 401 (got ${noAuthStats.status})`
    );

    // ----------------------------------------------------
    // TEST 3: Tampered / Forged Token Rejection
    // ----------------------------------------------------
    console.log("\n[3] Testing Tampered Token Rejection:");
    const forgedRes = await fetch(`${BASE_URL}/api/customers`, {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.forged_payload.fake_signature" }
    });
    assert(
      forgedRes.status === 403,
      `Tampered token rejected with HTTP 403 Forbidden (got ${forgedRes.status})`
    );

    // ----------------------------------------------------
    // TEST 4: Security Headers
    // ----------------------------------------------------
    console.log("\n[4] Testing Protective Security Headers:");
    const xFrame = healthRes.headers.get("x-frame-options");
    assert(xFrame === "DENY", `X-Frame-Options is 'DENY' (Clickjacking defense)`);

    const xContentType = healthRes.headers.get("x-content-type-options");
    assert(xContentType === "nosniff", `X-Content-Type-Options is 'nosniff' (MIME sniff defense)`);

    const referrer = healthRes.headers.get("referrer-policy");
    assert(
      referrer === "strict-origin-when-cross-origin",
      `Referrer-Policy is 'strict-origin-when-cross-origin'`
    );

    // ----------------------------------------------------
    // TEST 5: User Authentication & Login
    // ----------------------------------------------------
    console.log("\n[5] Testing Authentication & Token Issuance:");
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrong_password_999" })
    });
    assert(
      badLoginRes.status === 401,
      `Invalid password rejected with HTTP 401 (got ${badLoginRes.status})`
    );

    const goodLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "gurukripa2026" })
    });
    const goodLoginData = await goodLoginRes.json();
    assert(goodLoginRes.status === 200, "Valid admin login returns HTTP 200");
    assert(!!goodLoginData.token, "Valid session token returned in response");
    assert(goodLoginData.user?.role === "Administrator", "User role returned as 'Administrator'");
    authToken = goodLoginData.token;

    // Verify /api/auth/me with the issued token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, "GET /api/auth/me with token returns HTTP 200");
    assert(meData.user?.username === "admin", "Authenticated user is 'admin'");

    // ----------------------------------------------------
    // TEST 6: Customer CRUD & Input Sanitization
    // ----------------------------------------------------
    console.log("\n[6] Testing Customer Operations & Input Sanitization:");
    const createCustRes = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: "Security Test User <script>alert(1)</script>",
        phone: "9826099999",
        serviceType: "Vehicle Insurance",
        vehicleNumber: "MP 09 SC 1001",
        notes: "Test sanitized note"
      })
    });
    const createCustData = await createCustRes.json();
    assert(createCustRes.status === 201, "Customer created successfully (HTTP 201)");
    testCustomerId = createCustData.data.id;
    assert(
      !createCustData.data.name.includes("<script>"),
      "Input sanitization stripped malicious script tag"
    );

    // ----------------------------------------------------
    // TEST 7: Insurance Policy & Renewal History Archiving
    // ----------------------------------------------------
    console.log("\n[7] Testing Insurance Policy & Renewal History:");
    const createInsRes = await fetch(`${BASE_URL}/api/insurances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        customerName: "Security Test User",
        customerPhone: "9826099999",
        vehicleReg: "MP 09 SC 1001",
        vehicleId: "MP 09 SC 1001",
        insuranceCompany: "Tata AIG General Insurance",
        policyNumber: "POL-SEC-2026-001",
        coverageType: "Comprehensive",
        expiryDate: "2026-11-15",
        premiumAmount: 32000,
        idvAmount: 2000000,
        ncbPercentage: 20
      })
    });
    const createInsData = await createInsRes.json();
    assert(createInsRes.status === 201, "Insurance policy created successfully (HTTP 201)");
    testInsuranceId = createInsData.data.id;

    // Renew Policy
    const renewRes = await fetch(`${BASE_URL}/api/insurances/${testInsuranceId}/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        newPolicyNumber: "POL-SEC-2026-001-RNW2",
        newPremiumAmount: 30000,
        newIdvAmount: 1800000,
        newNcbPercentage: 25
      })
    });
    const renewData = await renewRes.json();
    assert(renewRes.status === 200, "Insurance renewed successfully (HTTP 200)");
    assert(
      renewData.data.renewalHistory && renewData.data.renewalHistory.length === 1,
      "Past policy archived into renewalHistory array"
    );
    assert(
      renewData.data.renewalHistory[0].policyNumber === "POL-SEC-2026-001",
      "Archived historical policy number matches initial policy"
    );
    assert(
      renewData.data.policyNumber === "POL-SEC-2026-001-RNW2",
      "Current active policy updated to new renewed policy number"
    );

    // ----------------------------------------------------
    // TEST 8: Cleanup Test Artifacts
    // ----------------------------------------------------
    console.log("\n[8] Cleaning Up Test Artifacts:");
    if (testInsuranceId) {
      const delIns = await fetch(`${BASE_URL}/api/insurances/${testInsuranceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      assert(delIns.status === 200, "Cleaned up test insurance record");
    }
    if (testCustomerId) {
      const delCust = await fetch(`${BASE_URL}/api/customers/${testCustomerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      assert(delCust.status === 200, "Cleaned up test customer record");
    }

    console.log("\n==========================================================");
    console.log(`🏁 TEST SUITE COMPLETED: ${testPassCount} PASSED, ${testFailCount} FAILED`);
    console.log("==========================================================");

    if (testFailCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test Suite crashed with unexpected error:", err);
    process.exit(1);
  }
}

runTestSuite();
