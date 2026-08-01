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
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAllPropertiesAuth() {
  console.log("=== TESTING ALL 6 PROPERTIES FOR 401 ERRORS ===");
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  const token = loginRes.body?.data?.token;
  if (!token) return;

  const authHeaders = { "Authorization": `Bearer ${token}` };

  const ctxRes = await checkEndpoint("/me/property-context", "GET", null, authHeaders);
  const assigned = ctxRes.body?.data?.assigned_properties || [];

  const endpointsToTest = [
    "/customers?status=active&per_page=5",
    "/setting/bank-accounts?is_active=1",
    "/setting/currencies",
    "/reports/daily-report?date=2026-07-27",
    "/me/property-context"
  ];

  for (const prop of assigned) {
    console.log(`\n--- TESTING PROPERTY: ${prop.display_name} (ID: ${prop.id}, Code: ${prop.property_code}) ---`);
    
    // 1. Post context switch
    const switchRes = await checkEndpoint("/me/property-context", "POST", { property_id: prop.id }, authHeaders);
    console.log(`   POST /me/property-context Status: ${switchRes.status}`);

    const propHeaders = { ...authHeaders, "x-selected-property-id": String(prop.id) };

    for (const ep of endpointsToTest) {
      const epRes = await checkEndpoint(ep, "GET", null, propHeaders);
      console.log(`   GET ${ep} => Status: ${epRes.status} ${epRes.status === 401 ? "❌ [401 UNAUTHORIZED CAUSES LOGOUT!]" : "✅"}`);
      if (epRes.status === 401) {
        console.log("   401 Response Payload:", JSON.stringify(epRes.body));
      }
    }
  }
}

testAllPropertiesAuth();
