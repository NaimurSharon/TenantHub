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

async function testCreateBank() {
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

  const payload = {
    bank_name: "Emirates NBD Test",
    branch_name: "Main Branch",
    account_name: "Operating Account",
    account_no: "998877665544",
    opening_balance: 1000,
    current_balance: 1000
  };

  const createRes = await checkEndpoint("/setting/bank-accounts", "POST", payload, authHeaders);
  console.log("\nPOST /setting/bank-accounts Status:", createRes.status);
  console.log("Response Body:", JSON.stringify(createRes.body, null, 2));
}

testCreateBank();
