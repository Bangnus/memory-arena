const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const frontendDir = path.resolve(rootDir, 'apps/frontend');
const standaloneDir = path.resolve(frontendDir, '.next/standalone/apps/frontend');

console.log('📦 Preparing Next.js standalone static assets for desktop packaging...');

// Ensure destination directories
const staticSrc = path.resolve(frontendDir, '.next/static');
const staticDest = path.resolve(standaloneDir, '.next/static');
const publicSrc = path.resolve(frontendDir, 'public');
const publicDest = path.resolve(standaloneDir, 'public');

if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('✅ Copied .next/static into standalone');
}

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('✅ Copied public into standalone');
}

console.log('🎉 Preparation complete!');
