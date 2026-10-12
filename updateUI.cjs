const fs = require('fs');
const glob = require('glob');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Screen backgrounds to bg-canvas
  content = content.replace(/bg-\[#F4F5F9\]/g, 'bg-canvas');
  content = content.replace(/bg-slate-50(?!0)/g, 'bg-canvas');
  content = content.replace(/bg-\[#F8F9FA\]/g, 'bg-canvas');
  
  // 2. Card rounded corners to rounded-3xl (24px)
  // Let's not blindly replace all rounded-2xl because some might be different. But cards generally use 24px per spec.
  // Actually, standard Tailwind rounded-2xl is 16px, rounded-3xl is 24px.
  // Let's replace 'rounded-2xl' -> 'rounded-3xl' for container divs.
  content = content.replace(/rounded-2xl/g, 'rounded-3xl');
  content = content.replace(/rounded-xl/g, 'rounded-2xl');

  // 3. Primary Button (rounded-full, shadow-glow)
  // Find <button ... bg-brand-600
  // Instead of complex regex, let's just make sure "rounded-3xl" on buttons becomes "rounded-full"
  content = content.replace(/<button([^>]*)rounded-3xl/g, '<button$1rounded-full');
  content = content.replace(/<button([^>]*)rounded-2xl/g, '<button$1rounded-full');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated UI in ${file}`);
  }
};

const srcFiles = glob.sync('src/**/*.{ts,tsx}', { nodir: true });
srcFiles.forEach(replaceInFile);

