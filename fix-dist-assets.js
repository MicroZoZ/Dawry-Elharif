// Run this AFTER `npx expo export -p web`, from your project root:
//   node fix-dist-assets.js
//
// Why: Vercel silently excludes any folder literally named "node_modules"
// from deployment, even if it's tracked in git and contains real assets
// (like fonts Expo bundles from @expo-google-fonts). This script renames
// every such folder inside dist/ to "vendor_assets" and rewrites all
// references to "node_modules" inside the built JS/HTML files so the
// paths still match.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const OLD_NAME = 'node_modules';
const NEW_NAME = 'vendor_assets';

function renameNodeModulesDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === OLD_NAME) {
                const newPath = path.join(dir, NEW_NAME);
                fs.renameSync(fullPath, newPath);
                console.log(`Renamed: ${fullPath} -> ${newPath}`);
                renameNodeModulesDirs(newPath);
            } else {
                renameNodeModulesDirs(fullPath);
            }
        }
    }
}

function replaceInFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            replaceInFiles(fullPath);
        } else if (/\.(js|html|json|map)$/.test(entry.name)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(OLD_NAME)) {
                content = content.split(OLD_NAME).join(NEW_NAME);
                fs.writeFileSync(fullPath, content);
                console.log(`Patched references in: ${fullPath}`);
            }
        }
    }
}

console.log('Step 1: Renaming node_modules folders inside dist/ ...');
renameNodeModulesDirs(ROOT);

console.log('Step 2: Patching references inside built files ...');
replaceInFiles(ROOT);

console.log('Done. Re-check dist/ — there should be no folder named "node_modules" anywhere.');
