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

async function analyzePropertyApis() {
  console.log("=== ANALYZING MULTI-PROPERTY APIS ON DEV BACKEND ===");
  
  // 1. Login
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  const token = loginRes.body?.data?.token;
  console.log("Login Token received:", !!token);
  if (!token) return;

  const authHeaders = {
    "Authorization": `Bearer ${token}`
  };

  // 2. GET /me/property-context
  const contextRes = await checkEndpoint("/me/property-context", "GET", null, authHeaders);
  console.log("\n1. GET /me/property-context Status:", contextRes.status);
  console.log("   Response Body:", JSON.stringify(contextRes.body, null, 2));

  // 3. GET /properties?is_active=1&per_page=25&page=1
  const propsRes = await checkEndpoint("/properties?is_active=1&per_page=25&page=1", "GET", null, authHeaders);
  console.log("\n2. GET /properties Status:", propsRes.status);
  console.log("   Properties Count:", propsRes.body?.data?.length);
  console.log("   Properties List:", JSON.stringify(propsRes.body?.data?.map(p => ({ id: p.id, name: p.name, code: p.property_code ?? p.code })), null, 2));

  // 4. Try POST or PUT /me/property-context to switch active property
  const propList = propsRes.body?.data ?? [];
  if (propList.length > 0) {
    const targetPropId = propList[0].id;
    console.log(`\n3. Testing POST /me/property-context with property_id: ${targetPropId}`);
    const setPostRes = await checkEndpoint("/me/property-context", "POST", { property_id: targetPropId }, authHeaders);
    console.log("   POST Status:", setPostRes.status, "| Response:", JSON.stringify(setPostRes.body, null, 2));

    console.log(`\n4. Testing PUT /me/property-context with property_id: ${targetPropId}`);
    const setPutRes = await checkEndpoint("/me/property-context", "PUT", { property_id: targetPropId }, authHeaders);
    console.log("   PUT Status:", setPutRes.status, "| Response:", JSON.stringify(setPutRes.body, null, 2));
  }
}

analyzePropertyApis();
