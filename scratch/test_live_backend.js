const https = require('https');

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

async function runTest() {
  const baseUrl = 'https://devbackendbms.siscotech.com/api';
  console.log('--- Step 1: Logging in ---');
  const loginRes = await request(`${baseUrl}/auth/login`, 'POST', {}, {
    email: 'yousuf@siscotek.com',
    password: 'password',
    device_name: 'react-native-test'
  });

  console.log('Login Status:', loginRes.status);
  console.log('Login Output:', JSON.stringify(loginRes.data, null, 2).substring(0, 500));

  const token = loginRes.data?.data?.token ?? loginRes.data?.token ?? loginRes.data?.access_token;
  if (!token) {
    console.error('No token received!');
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-selected-property-id': '1'
  };

  console.log('\n--- Step 2: Fetching /customers ---');
  const customersRes = await request(`${baseUrl}/customers`, 'GET', authHeaders);
  console.log('Customers Status:', customersRes.status);
  if (customersRes.data) {
    const list = customersRes.data.data ?? customersRes.data;
    console.log('Customers Count:', Array.isArray(list) ? list.length : 'Object');
    if (Array.isArray(list) && list.length > 0) {
      console.log('Sample Customer:', JSON.stringify(list[0], null, 2));
      const customerId = list[0].id;

      console.log(`\n--- Step 3: Fetching /customers/${customerId}/hub ---`);
      const hubRes = await request(`${baseUrl}/customers/${customerId}/hub`, 'GET', authHeaders);
      console.log('Hub Status:', hubRes.status);
      console.log('Hub Keys:', Object.keys(hubRes.data?.data ?? hubRes.data ?? {}));
      console.log('Hub Header/Currency/Date Details:', JSON.stringify({
        header: hubRes.data?.data?.header ?? hubRes.data?.header,
        summary: hubRes.data?.data?.summary ?? hubRes.data?.summary
      }, null, 2));
    }
  }

  console.log('\n--- Step 4: Fetching /setting/bank-accounts ---');
  const bankRes = await request(`${baseUrl}/setting/bank-accounts`, 'GET', authHeaders);
  console.log('Bank Accounts Status:', bankRes.status);
  console.log('Bank Accounts Output:', JSON.stringify(bankRes.data, null, 2).substring(0, 400));

  console.log('\n--- Step 5: Fetching /setting/preference ---');
  const prefRes = await request(`${baseUrl}/setting/preference`, 'GET', authHeaders);
  console.log('Preference Status:', prefRes.status);
  console.log('Preference Output:', JSON.stringify(prefRes.data, null, 2));
}

runTest().catch(console.error);
