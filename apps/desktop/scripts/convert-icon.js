const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

const fn = pngToIco.default || pngToIco;
const srcPath = path.resolve(__dirname, '../../frontend/src/app/icon.png');
const destPath = path.resolve(__dirname, '../build/icon.ico');

console.log('Converting:', srcPath);
console.log('Target:', destPath);

fn(srcPath)
  .then((buf) => {
    fs.writeFileSync(destPath, buf);
    console.log('✅ Successfully generated icon.ico (Size:', buf.length, 'bytes)');
  })
  .catch((err) => {
    console.error('❌ Failed to convert icon:', err);
    process.exit(1);
  });
