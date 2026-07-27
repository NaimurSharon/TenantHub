const https = require('https');
const fs = require('fs');
const path = require('path');

// Read EXPO_PUBLIC_API_BASE dynamically from .env file
function getEnvApiBase() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/EXPO_PUBLIC_API_BASE=(.+)/);
    if (match && match[1]) {
      return match[1].trim().replace(/\/+$/, '');
    }
  }
  return 'https://backendbms.siscotech.com/api';
}

function request(urlStr, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verifyAllApis() {
  const baseUrl = getEnvApiBase();
  console.log('=== API VERIFICATION SUITE (Reading from .env) ===');
  console.log('Target Base URL from .env:', baseUrl);
  console.log('1. Authenticating against:', `${baseUrl}/auth/login`);

  const loginRes = await request(`${baseUrl}/auth/login`, 'POST', {}, {
    email: 'yousuf@siscotek.com',
    password: 'password',
    device_name: 'react-native-verification'
  });

  const token = loginRes.data?.data?.token ?? loginRes.data?.token;
  console.log(`-> Auth Status: ${loginRes.status} | Token Granted: ${!!token}`);

  if (!token) {
    console.log('Login Output:', JSON.stringify(loginRes.data, null, 2));
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-selected-property-id': '1'
  };

  // 1. Tenants List & Portfolio Summary
  console.log('\n2. Tenant List API (GET /customers)');
  const customersRes = await request(`${baseUrl}/customers`, 'GET', authHeaders);
  const tenants = customersRes.data?.data ?? [];
  console.log(`-> Status: ${customersRes.status} | Returned ${tenants.length} tenants from production server.`);

  // 2. Tenant Hub Detail
  if (tenants.length > 0) {
    const tenantId = tenants[0].id;
    console.log(`\n3. Tenant Hub API (GET /customers/${tenantId}/hub)`);
    const hubRes = await request(`${baseUrl}/customers/${tenantId}/hub`, 'GET', authHeaders);
    console.log(`-> Status: ${hubRes.status} | Display Name: "${hubRes.data?.data?.header?.display_name}"`);
  }

  // 3. System Currencies
  console.log('\n4. Active Currency Preference API (GET /setting/currencies)');
  const currRes = await request(`${baseUrl}/setting/currencies`, 'GET', authHeaders);
  const activeCurr = (currRes.data?.data ?? []).find(c => c.is_default === 1 || c.is_active === 1) || currRes.data?.data?.[0];
  console.log(`-> Status: ${currRes.status} | Active Currency Symbol: "${activeCurr?.symbol}" (${activeCurr?.code})`);

  // 4. Financial Hub
  console.log('\n5. Bank Accounts API (GET /setting/bank-accounts)');
  const bankRes = await request(`${baseUrl}/setting/bank-accounts`, 'GET', authHeaders);
  const accounts = bankRes.data?.data?.bank_accounts ?? [];
  console.log(`-> Status: ${bankRes.status} | Returned ${accounts.length} bank accounts.`);
}

verifyAllApis().catch(console.error);
