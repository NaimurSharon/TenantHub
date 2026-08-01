const http = require("https");

const BASE_URL = "https://devbackendbms.siscotech.com/api";

function checkEndpoint(path, method = "GET", body = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOpts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...headers
      }
    };

    const req = http.request(reqOpts, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function debugPropertySwitchAuth() {
  console.log("=== DEBUGGING PROPERTY SWITCH AUTH & TOKEN BEHAVIOR ===");

  // 1. Login
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  const token = loginRes.body?.data?.token;
  console.log("1. Login status:", loginRes.status, "| Token received:", token ? token.substring(0, 15) + "..." : "none");
  if (!token) return;

  const authHeaders = { "Authorization": `Bearer ${token}` };

  // 2. Call GET /me/property-context
  const ctxRes = await checkEndpoint("/me/property-context", "GET", null, authHeaders);
  console.log("\n2. GET /me/property-context status:", ctxRes.status);
  const assigned = ctxRes.body?.data?.assigned_properties || [];
  console.log("   Assigned properties count:", assigned.length);

  // 3. Test POST /me/property-context
  if (assigned.length > 1) {
    const targetProp = assigned[1];
    console.log(`\n3. Calling POST /me/property-context for property '${targetProp.display_name}' (ID: ${targetProp.id})...`);
    
    const switchRes = await checkEndpoint("/me/property-context", "POST", { property_id: targetProp.id }, authHeaders);
    console.log("   POST /me/property-context status:", switchRes.status);
    console.log("   POST /me/property-context response body:", JSON.stringify(switchRes.body, null, 2));

    // Does POST response contain a new token?
    console.log("\n4. Checking if POST response returned a new token or token update:");
    console.log("   data.token in response:", switchRes.body?.data?.token || switchRes.body?.token || "NONE");

    // 5. Test making subsequent requests with ORIGINAL token
    console.log("\n5. Testing GET /customers WITH ORIGINAL TOKEN & x-selected-property-id header:");
    const custRes1 = await checkEndpoint("/customers?status=active", "GET", null, {
      ...authHeaders,
      "x-selected-property-id": String(targetProp.id)
    });
    console.log("   GET /customers Status:", custRes1.status);
    console.log("   GET /customers Response:", JSON.stringify(custRes1.body, null, 2).substring(0, 300));

    console.log("\n6. Testing GET /setting/bank-accounts WITH ORIGINAL TOKEN & x-selected-property-id header:");
    const bankRes1 = await checkEndpoint("/setting/bank-accounts?is_active=1", "GET", null, {
      ...authHeaders,
      "x-selected-property-id": String(targetProp.id)
    });
    console.log("   GET /setting/bank-accounts Status:", bankRes1.status);
    console.log("   GET /setting/bank-accounts Response:", JSON.stringify(bankRes1.body, null, 2).substring(0, 300));

    // 7. Testing WITHOUT x-selected-property-id header
    console.log("\n7. Testing GET /customers WITHOUT x-selected-property-id header:");
    const custRes2 = await checkEndpoint("/customers?status=active", "GET", null, authHeaders);
    console.log("   GET /customers Status (no header):", custRes2.status);

    console.log("\n8. Testing GET /me/property-context after switch:");
    const ctxRes2 = await checkEndpoint("/me/property-context", "GET", null, authHeaders);
    console.log("   GET /me/property-context Status:", ctxRes2.status);
    console.log("   Selected property now:", ctxRes2.body?.data?.selected_property?.display_name);
  }
}

debugPropertySwitchAuth();
