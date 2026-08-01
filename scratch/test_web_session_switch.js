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
          resolve({ status: res.statusCode, body: parsed, headers: res.headers, rawData: data });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers, rawData: data });
        }
      });
    });

    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testWebSessionSwitch() {
  console.log("=== TESTING WEB SESSION COOKIE & PROPERTY SWITCH BEHAVIOR ===");

  // Login
  const loginRes = await checkEndpoint("/auth/login", "POST", {
    email: "yousuf@siscotek.com",
    password: "password"
  });

  console.log("Login Status:", loginRes.status);
  console.log("Set-Cookie headers from login:", loginRes.headers["set-cookie"]);

  const token = loginRes.body?.data?.token;
  const cookies = (loginRes.headers["set-cookie"] || []).map(c => c.split(";")[0]).join("; ");

  console.log("Cookies string:", cookies);

  const reqHeaders = {
    "Authorization": `Bearer ${token}`,
    "Cookie": cookies,
    "X-Requested-With": "XMLHttpRequest"
  };

  // POST /me/property-context
  const switchRes = await checkEndpoint("/me/property-context", "POST", { property_id: 5 }, reqHeaders);
  console.log("\nPOST /me/property-context Status:", switchRes.status);
  console.log("Set-Cookie headers from switch:", switchRes.headers["set-cookie"]);

  // Test subsequent request with updated cookies
  const newCookies = (switchRes.headers["set-cookie"] || []).map(c => c.split(";")[0]).join("; ") || cookies;
  const nextRes = await checkEndpoint("/customers?status=active", "GET", null, {
    "Authorization": `Bearer ${token}`,
    "Cookie": newCookies,
    "X-Requested-With": "XMLHttpRequest"
  });

  console.log("\nSubsequent GET /customers Status:", nextRes.status);
}

testWebSessionSwitch();
