const https = require('https');

function get(path, token) {
  return new Promise((resolve) => {
    const url = new URL(`https://devbackendbms.siscotech.com/api${path}`);
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-selected-property-id': '1'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ path, status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ path, status: res.statusCode, raw: data.substring(0, 150) });
        }
      });
    });
    req.on('error', (e) => resolve({ path, error: e.message }));
    req.end();
  });
}

async function testAllEndpoints() {
  const token = "284|4E1I26TFa0rudi5d0whaqeCceMrZuCuq0beAbYDD8aeb5c61";
  const endpoints = [
    '/me',
    '/properties/1',
    '/setting/currencies',
    '/setting/bank-accounts',
    '/setting/preferences',
    '/setting/preference',
    '/setting/general-settings',
    '/setting/system-settings',
    '/setting/app-settings',
    '/setting/format',
    '/setting/formats',
    '/setting/options',
    '/setting/configs',
    '/setting/config',
    '/setting/date-format',
    '/settings',
    '/preferences',
    '/options',
    '/configurations',
  ];

  for (const ep of endpoints) {
    const res = await get(ep, token);
    console.log(`[${res.status}] ${ep}`);
    if (res.status === 200) {
      console.log('RESPONSE:', JSON.stringify(res.data, null, 2).substring(0, 500));
    }
  }
}

testAllEndpoints();
