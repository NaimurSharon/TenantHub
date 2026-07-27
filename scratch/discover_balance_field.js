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

async function discoverBalanceField() {
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

  const fieldsToTest = [
    { opening_balance: 5000 },
    { initial_balance: 5000 },
    { balance: 5000 },
    { starting_balance: 5000 },
    { current_balance: 5000 },
    { amount: 5000 }
  ];

  for (const field of fieldsToTest) {
    const fieldName = Object.keys(field)[0];
    const payload = {
      bank_name: `Balance Test (${fieldName})`,
      branch_name: "Main Branch",
      account_name: "Test Account",
      account_no: `ACC-${Date.now()}`,
      ...field
    };

    const res = await checkEndpoint("/setting/bank-accounts", "POST", payload, authHeaders);
    console.log(`Payload Field '${fieldName}: 5000' => Status: ${res.status}`);
    if (res.body?.data?.bank_account) {
      const b = res.body.data.bank_account;
      console.log(`   Saved Current Balance:`, b.current_balance, `| Keys in saved object:`, Object.keys(b));
    }
  }
}

discoverBalanceField();
