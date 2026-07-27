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

async function testBankList() {
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  const token = loginRes.body?.data?.token;
  if (!token) return;

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "x-selected-property-id": "1"
  };

  const res = await checkEndpoint("/setting/bank-accounts?is_active=1", "GET", null, authHeaders);
  console.log("=== GET /setting/bank-accounts?is_active=1 RESPONSE ===");
  console.log(JSON.stringify(res.body, null, 2));
}

testBankList();
