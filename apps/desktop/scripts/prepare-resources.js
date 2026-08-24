const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const frontendDir = path.resolve(rootDir, 'apps/frontend');
const backendDir = path.resolve(rootDir, 'apps/backend');
const desktopDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(desktopDir, 'build');
const standaloneDir = path.resolve(frontendDir, '.next/standalone/apps/frontend');

console.log('📦 Preparing Next.js standalone static assets for desktop packaging...');

// 1. Next.js standalone static assets
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

// 2. Prepare merged backend-node_modules for production packaging
console.log('📦 Preparing backend runtime node_modules...');
const targetModulesDir = path.resolve(buildDir, 'backend-node_modules');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}
if (fs.existsSync(targetModulesDir)) {
  fs.rmSync(targetModulesDir, { recursive: true, force: true });
}
fs.mkdirSync(targetModulesDir, { recursive: true });

const rootModulesDir = path.resolve(rootDir, 'node_modules');
const backendModulesDir = path.resolve(backendDir, 'node_modules');

function copyModules(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.bin' || entry.name === '.cache') continue;
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('@')) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyModules(srcPath, destPath);
      } else {
        if (!fs.existsSync(destPath)) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        }
      }
    }
  }
}

// Copy root node_modules first (hoisted packages like tslib)
if (fs.existsSync(rootModulesDir)) {
  console.log('Copying root node_modules...');
  copyModules(rootModulesDir, targetModulesDir);
}

// Copy backend node_modules over (overrides with backend-specific versions and .prisma)
if (fs.existsSync(backendModulesDir)) {
  console.log('Copying backend node_modules...');
  copyModules(backendModulesDir, targetModulesDir);
  // Ensure .prisma is copied
  const prismaSrc = path.join(backendModulesDir, '.prisma');
  const prismaDest = path.join(targetModulesDir, '.prisma');
  if (fs.existsSync(prismaSrc)) {
    fs.cpSync(prismaSrc, prismaDest, { recursive: true });
  }
}

console.log('✅ Prepared merged backend node_modules in build/backend-node_modules');

// 3. Prepare frontend runtime node_modules for standalone
console.log('📦 Preparing frontend standalone runtime node_modules...');
const targetFrontendModulesDir = path.resolve(buildDir, 'frontend-node_modules');
if (fs.existsSync(targetFrontendModulesDir)) {
  fs.rmSync(targetFrontendModulesDir, { recursive: true, force: true });
}
fs.mkdirSync(targetFrontendModulesDir, { recursive: true });

const standaloneModulesSrc = path.resolve(frontendDir, '.next/standalone/node_modules');
if (fs.existsSync(standaloneModulesSrc)) {
  fs.cpSync(standaloneModulesSrc, targetFrontendModulesDir, { recursive: true });
  console.log('✅ Copied standalone node_modules into build/frontend-node_modules');
}

console.log('🎉 Preparation complete!');


