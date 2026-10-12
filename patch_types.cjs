const fs = require('fs');

const file = 'src/types/navigation.ts';
let content = fs.readFileSync(file, 'utf8');

// Add lat and lng to BuildingInfo
if (!content.includes('lat?: number;')) {
  content = content.replace(/imageUrl: string;/g, 'imageUrl: string;\n  lat?: number;\n  lng?: number;');
  fs.writeFileSync(file, content);
}
