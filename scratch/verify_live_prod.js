const http = require("https");

const BASE_URL = "https://backendbms.siscotech.com/api";

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
          resolve({ status: res.statusCode, body: data.substring(0, 100) });
        }
      });
    });

    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runVerification() {
  console.log("=== LIVE PRODUCTION BACKEND HEALTH AUDIT ===");
  console.log("Target API Base:", BASE_URL);

  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });
  console.log("\n1. POST /auth/login Status:", loginRes.status, "| Success:", loginRes.body?.success);

  if (loginRes.body?.data?.token) {
    const token = loginRes.body.data.token;
    const authHeaders = {
      "Authorization": `Bearer ${token}`,
      "x-selected-property-id": "1"
    };

    const currRes = await checkEndpoint("/setting/currencies", "GET", null, authHeaders);
    console.log("\n2. GET /setting/currencies Status:", currRes.status, "| Currencies Returned:", currRes.body?.data?.length);

    const custRes = await checkEndpoint("/customers?page=1&per_page=5", "GET", null, authHeaders);
    console.log("\n3. GET /customers Status:", custRes.status, "| Customers Returned:", custRes.body?.data?.length);
  }

  console.log("\n=== AUDIT COMPLETE ===");
}

runVerification();
