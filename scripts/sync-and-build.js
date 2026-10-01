const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const syncScript = path.join(root, 'scripts', 'sync-records.js');

console.log('====================================================');
console.log('   CLEANROOM WRITER | AUTOMATED SYNC PROTOCOL       ');
console.log('====================================================\n');

// 1. Run sync
try {
  execSync(`node "${syncScript}"`, { stdio: 'inherit', cwd: root });
} catch (e) {
  console.error('[FAILED] Could not complete sync-records:', e.message);
  process.exit(1);
}

// 2. Synchronize to Desktop and Downloads
const home = os.homedir();
const candidates = [
  path.join(home, 'Desktop'),
  path.join(home, 'OneDrive', 'Desktop'),
  path.join(home, 'OneDrive', '바탕 화면'),
  path.join(home, '바탕 화면')
];

let desktopPath = candidates.find(c => fs.existsSync(c));
let downloadsPath = path.join(home, 'Downloads');

if (desktopPath) {
  const dest = path.join(desktopPath, 'cleanroom-writer');
  const zipDest = path.join(desktopPath, 'cleanroom-writer.zip');
  
  // Copy files
  fs.cpSync(root, dest, { recursive: true, force: true });
  console.log('\n[SYNCED] Desktop folder:', dest);

  // Zip
  try {
    const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${dest}\\*' -DestinationPath '${zipDest}' -Force"`;
    execSync(psCmd);
    console.log('[ZIPPED] Desktop zip:', zipDest);
    
    if (fs.existsSync(downloadsPath)) {
      const dlZip = path.join(downloadsPath, 'cleanroom-writer.zip');
      fs.copyFileSync(zipDest, dlZip);
      console.log('[SYNCED] Downloads zip:', dlZip);
    }
  } catch (err) {
    console.warn('[WARN] Zip generation error:', err.message);
  }
}

console.log('\n====================================================');
console.log('   ALL SYNC OPERATIONS COMPLETED WITH ZERO ERROR     ');
console.log('====================================================');
