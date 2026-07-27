const https = require('https');

const req = https.request('https://devbackendbms.siscotech.com/api/setting/currencies', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer 284|4E1I26TFa0rudi5d0whaqeCceMrZuCuq0beAbYDD8aeb5c61',
    'x-selected-property-id': '1'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});
req.end();
