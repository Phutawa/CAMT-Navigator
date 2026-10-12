const fs = require('fs');
const glob = require('glob');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace shadow-xl shadow-brand-600/30 with shadow-glow
  content = content.replace(/shadow-xl shadow-brand-600\/[0-9]+/g, 'shadow-glow');
  content = content.replace(/shadow-lg shadow-brand-600\/[0-9]+/g, 'shadow-glow');
  content = content.replace(/shadow-md shadow-brand-500\/[0-9]+/g, 'shadow-glow');

  // Replace shadow-sm with shadow-soft for cards and chips
  content = content.replace(/shadow-sm/g, 'shadow-soft');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated shadow in ${file}`);
  }
};

const srcFiles = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
srcFiles.forEach(replaceInFile);

