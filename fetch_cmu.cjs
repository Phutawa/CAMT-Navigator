const https = require('https');
const fs = require('fs');

const query = `
[out:json];
// 1. Get CMU boundary
way(189632187);
out geom;

// 2. Get university buildings/faculties in CMU
area["name"="มหาวิทยาลัยเชียงใหม่"]->.cmu;
(
  node(area.cmu)[name~"คณะ"];
  way(area.cmu)[name~"คณะ"];
  node(area.cmu)[name~"สำนัก"];
  way(area.cmu)[name~"สำนัก"];
  node(area.cmu)[name~"หอพัก"];
  way(area.cmu)[name~"หอพัก"];
);
out center;
`;

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('cmu_data.json', data);
    console.log('Saved to cmu_data.json');
  });
});

req.write(query);
req.end();
