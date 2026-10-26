/**
 * Automated Test for Document Compression & Decompression Pipeline
 */

import zlib from "zlib";

const BASE_URL = "http://localhost:5000";

let passCount = 0;
let failCount = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failCount++;
  }
}

async function runCompressionTests() {
  console.log("==========================================================");
  console.log("🗜️ DOCUMENT COMPRESSION & DECOMPRESSION TEST SUITE");
  console.log("==========================================================");

  try {
    // 1. Authenticate as Admin
    console.log("\n[1] Admin Authentication:");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "gurukripa2026" })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "Admin login successful");
    const token = loginData.token;

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    // 2. Generate a realistic document payload (text with structure)
    console.log("\n[2] Document Upload with Level-9 Compression:");
    const rawPdfText = "%PDF-1.4\n1 0 obj\n<< /Title (GuruKripa Commercial Vehicle Certificate) /Author (GuruKripa Yatayat) >>\nendobj\n" +
      "Vehicle Registration: MP-09-AB-1234\nPolicy Holder: Ramesh Sharma\nCoverage Details: Commercial All India Transit\n".repeat(40) +
      "%%EOF";

    const originalBuffer = Buffer.from(rawPdfText);
    const originalB64 = originalBuffer.toString("base64");
    const originalDataUrl = `data:application/pdf;base64,${originalB64}`;

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        filename: "test_commercial_policy.pdf",
        base64Data: originalDataUrl
      })
    });
    const uploadData = await uploadRes.json();

    assert(uploadRes.status === 200, "Upload endpoint returned HTTP 200");
    assert(uploadData.isCompressed === true, "Document was marked as compressed");
    assert(uploadData.compressedSize < uploadData.documentSize, `Size reduced from ${uploadData.documentSize}B to ${uploadData.compressedSize}B`);
    assert(uploadData.documentUrl.startsWith("gz:data:"), "Document URL formatted with 'gz:data:' prefix for Atlas persistence");
    console.log(`     Space saved: ${uploadData.compressionSavings}`);

    // 3. Test Server-side API Decompression (JSON)
    console.log("\n[3] Testing JSON Decompression Endpoint (/api/upload/decompress):");
    const decompressRes = await fetch(`${BASE_URL}/api/upload/decompress`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ doc: uploadData.documentUrl })
    });
    const decompressData = await decompressRes.json();
    assert(decompressRes.status === 200, "Decompress endpoint returned HTTP 200");
    assert(decompressData.dataUrl === originalDataUrl, "Decompressed payload exactly matches original uncompressed Data URL");

    // 4. Test Streamed View/Download Endpoint (/api/upload/view)
    console.log("\n[4] Testing Direct Browser Stream Endpoint (/api/upload/view):");
    const viewRes = await fetch(`${BASE_URL}/api/upload/view?doc=${encodeURIComponent(uploadData.documentUrl)}&name=test.pdf`);
    assert(viewRes.status === 200, "View endpoint returned HTTP 200");
    assert(viewRes.headers.get("content-type") === "application/pdf", "Content-Type is 'application/pdf'");
    const viewBuffer = Buffer.from(await viewRes.arrayBuffer());
    assert(viewBuffer.equals(originalBuffer), "Streamed binary PDF matches original bytes bit-for-bit");

    console.log("\n==========================================================");
    console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log("==========================================================");

    process.exit(failCount === 0 ? 0 : 1);
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  }
}

runCompressionTests();
