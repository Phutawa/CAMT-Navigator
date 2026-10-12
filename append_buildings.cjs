const fs = require('fs');

const file = 'src/data/campusData.ts';
let content = fs.readFileSync(file, 'utf8');

const newBuildings = fs.readFileSync('new_buildings.txt', 'utf8');

// Find the end of CMU_BUILDINGS array
const searchStr = '  }\n];';
if (content.includes(searchStr)) {
  content = content.replace(searchStr, '  },\n' + newBuildings + '\n];');
  fs.writeFileSync(file, content);
  console.log('Appended successfully!');
} else {
  console.log('Could not find the insertion point!');
}
