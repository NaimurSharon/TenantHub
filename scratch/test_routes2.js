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

async function testRoutes() {
  const token = "284|4E1I26TFa0rudi5d0whaqeCceMrZuCuq0beAbYDD8aeb5c61";
  const routes = [
    '/setting/general',
    '/setting/company',
    '/setting/currency',
    '/setting/currencies',
    '/setting/properties',
    '/setting/property',
    '/setting/system',
    '/setting/preferences',
    '/settings/currency',
    '/settings/general',
  ];

  for (const r of routes) {
    const res = await get(r, token);
    console.log(`PATH: ${r} => STATUS: ${res.status}`);
    if (res.status === 200) {
      console.log('DATA:', JSON.stringify(res.data, null, 2).substring(0, 400));
    }
  }
}

testRoutes();
