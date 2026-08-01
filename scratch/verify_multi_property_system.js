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

async function verifyMultiPropertySystem() {
  console.log("=== EMPIRICAL MULTI-PROPERTY SYSTEM VERIFICATION (DEV API) ===");
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  const token = loginRes.body?.data?.token;
  if (!token) {
    console.error("Login failed!");
    return;
  }

  const authHeaders = { "Authorization": `Bearer ${token}` };

  // 1. Fetch initial property context
  const contextRes = await checkEndpoint("/me/property-context", "GET", null, authHeaders);
  console.log("1. GET /me/property-context Status:", contextRes.status);
  const assigned = contextRes.body?.data?.assigned_properties || [];
  console.log(`   Assigned Properties (${assigned.length}):`, assigned.map(p => `${p.display_name} (${p.property_code})`));

  if (assigned.length > 1) {
    const targetProp = assigned[2]; // Switch to Kowshick Property
    console.log(`\n2. Switching active property to '${targetProp.display_name}' (ID: ${targetProp.id})...`);
    
    // POST /me/property-context
    const switchRes = await checkEndpoint("/me/property-context", "POST", { property_id: targetProp.id }, authHeaders);
    console.log("   POST /me/property-context Status:", switchRes.status);
    console.log("   Selected Property in Response:", switchRes.body?.data?.selected_property?.display_name);

    // Verify tenant list with x-selected-property-id header
    const propHeaders = { ...authHeaders, "x-selected-property-id": String(targetProp.id) };
    const tenantsRes = await checkEndpoint("/customers?status=active&per_page=5", "GET", null, propHeaders);
    console.log(`\n3. GET /customers with x-selected-property-id: ${targetProp.id} Status:`, tenantsRes.status);
    console.log("   Returned Tenants Count:", tenantsRes.body?.data?.total ?? tenantsRes.body?.data?.length ?? 0);
  }
}

verifyMultiPropertySystem();
