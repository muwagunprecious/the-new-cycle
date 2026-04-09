const https = require('https');

const data = JSON.stringify({
  to: "09023323399",
  from: "N-Alert",
  sms: "your go-cycle code is 123456",
  type: "plain",
  channel: "dnd",
  api_key: "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD"
});

const options = {
  hostname: 'api.ng.termii.com',
  path: '/api/sms/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let resData = '';
  res.on('data', (chunk) => {
    resData += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${resData}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
