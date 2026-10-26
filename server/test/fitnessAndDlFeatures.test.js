/**
 * Test Suite for Fitness, Driving Licences, and Document Upload
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

async function runFitnessAndDlTests() {
  console.log("==========================================================");
  console.log("📋 FITNESS, DRIVING LICENCE & UPLOAD AUTOMATED TEST SUITE");
  console.log("==========================================================");

  let authToken = null;
  let testFitnessId = null;
  let testDlId = null;
  let uploadedDocUrl = null;

  try {
    // 1. Authenticate as Admin
    console.log("\n[1] Admin Authentication:");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "gurukripa2026" })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "Admin login successful (HTTP 200)");
    authToken = loginData.token;
    assert(!!authToken, "Received valid Bearer auth token");

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    };

    // 2. Test PDF Document Upload endpoint
    console.log("\n[2] Document Upload (Base64 PDF):");
    const sampleBase64Pdf = "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9Db3VudCAwID4+CmVuZG9iagoxIDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyA0IDAgUiA+PgplbmRvYmoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRgo=";
    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        fileName: "test_certificate.pdf",
        base64Data: `data:application/pdf;base64,${sampleBase64Pdf}`,
        fileSize: 154
      })
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 200, "PDF upload returned HTTP 200");
    assert(uploadData.success === true, "Upload response indicates success");
    assert(
      uploadData.documentUrl && (uploadData.documentUrl.startsWith("/uploads/") || uploadData.documentUrl.startsWith("gz:data:")),
      `Uploaded document URL returned: ${uploadData.documentUrl.slice(0, 40)}...`
    );
    uploadedDocUrl = uploadData.documentUrl;

    // 3. Test Fitness Category (Name, Mobile, V No, Expiry, RTO, PDF, Payment)
    console.log("\n[3] Fitness Category Operations:");
    const fitnessPayload = {
      customerName: "Ramesh Sharma",
      customerPhone: "9826011111",
      vehicleReg: "MP09AB1234",
      expiryDate: "2027-03-31",
      rtoAffiliated: "RTO Indore (MP-09)",
      totalAmount: 1800,
      paidAmount: 1800,
      documentUrl: uploadedDocUrl,
      documentName: "test_certificate.pdf"
    };

    const createFitnessRes = await fetch(`${BASE_URL}/api/fitness`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(fitnessPayload)
    });
    const fitnessCreated = await createFitnessRes.json();
    assert(createFitnessRes.status === 201, "Fitness record created (HTTP 201)");
    assert(fitnessCreated.data.vehicleReg === "MP09AB1234", "Fitness vehicle reg matches");
    assert(fitnessCreated.data.rtoAffiliated === "RTO Indore (MP-09)", "Fitness RTO affiliated matches");
    assert(fitnessCreated.data.paymentStatus === "Paid", "Fitness marked as Paid");
    assert(fitnessCreated.data.documentUrl === uploadedDocUrl, "Fitness document attached");
    testFitnessId = fitnessCreated.data.id;

    // Test Fitness Renewal
    const renewFitnessRes = await fetch(`${BASE_URL}/api/fitness/${testFitnessId}/renew`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        newExpiryDate: "2028-03-31",
        newFeeAmount: 2000,
        newPaidAmount: 2000
      })
    });
    const fitnessRenewed = await renewFitnessRes.json();
    assert(renewFitnessRes.status === 200, "Fitness renewed (HTTP 200)");
    assert(fitnessRenewed.data.expiryDate === "2028-03-31", "Fitness expiry updated");
    assert(fitnessRenewed.data.renewalHistory.length === 1, "Fitness past certificate archived in renewal history");

    // 4. Test Driving Licence Category (Name, Mobile, Expiry, RTO, PDF, Payment)
    console.log("\n[4] Driving Licence Category Operations:");
    const dlPayload = {
      customerName: "Sunil Verma",
      customerPhone: "9826022222",
      expiryDate: "2030-05-15",
      rtoAffiliated: "RTO Bhopal (MP-04)",
      totalAmount: 2500,
      paidAmount: 1500,
      documentUrl: uploadedDocUrl,
      documentName: "test_certificate.pdf"
    };

    const createDlRes = await fetch(`${BASE_URL}/api/driving-licences`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(dlPayload)
    });
    const dlCreated = await createDlRes.json();
    assert(createDlRes.status === 201, "DL record created (HTTP 201)");
    assert(dlCreated.data.customerName === "Sunil Verma", "DL customer name matches");
    assert(dlCreated.data.rtoAffiliated === "RTO Bhopal (MP-04)", "DL RTO affiliated matches");
    assert(dlCreated.data.dueAmount === 1000, "DL due amount computed correctly (2500 - 1500 = 1000)");
    assert(dlCreated.data.paymentStatus === "Partial", "DL marked as Partial payment");
    testDlId = dlCreated.data.id;

    // 5. Test Dashboard Stats
    console.log("\n[5] Dashboard Aggregates with Fitness & DL:");
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: authHeaders
    });
    const statsData = await statsRes.json();
    const statsObj = statsData.stats || statsData.data;
    assert(statsRes.status === 200, "Dashboard stats returned HTTP 200");
    assert(statsObj.totalFitness >= 1, "Stats includes totalFitness >= 1");
    assert(statsObj.totalDrivingLicences >= 1, "Stats includes totalDrivingLicences >= 1");
    assert(statsObj.fitnessBilled >= 2000, "Stats includes fitnessBilled");
    assert(statsObj.dlBilled >= 2500, "Stats includes dlBilled");
    assert(statsObj.dlDue >= 1000, "Stats includes dlDue");

    // 6. Clean up test records
    console.log("\n[6] Cleanup:");
    const delFitRes = await fetch(`${BASE_URL}/api/fitness/${testFitnessId}`, {
      method: "DELETE",
      headers: authHeaders
    });
    assert(delFitRes.status === 200, "Deleted test fitness record");

    const delDlRes = await fetch(`${BASE_URL}/api/driving-licences/${testDlId}`, {
      method: "DELETE",
      headers: authHeaders
    });
    assert(delDlRes.status === 200, "Deleted test DL record");

    console.log("\n==========================================================");
    console.log(`🏁 TEST RESULTS: ${testPassCount} PASSED, ${testFailCount} FAILED`);
    console.log("==========================================================");

    process.exit(testFailCount === 0 ? 0 : 1);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runFitnessAndDlTests();
