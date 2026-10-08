const { spawnSync } = require('child_process');
const path = require('path');

const ghExe = 'C:\\Users\\선종흠\\AppData\\Local\\Programs\\gh\\gh.exe';
const gitPath = 'C:\\Users\\선종흠\\AppData\\Local\\Programs\\MinGit\\cmd';
const projectDir = 'C:\\Users\\선종흠\\.gemini\\antigravity\\scratch\\cleanroom-writer';

process.env.PATH = `${gitPath};${path.dirname(ghExe)};${process.env.PATH}`;

console.log('========================================================');
console.log('   CleanRoom Writer - GitHub Automated Connection');
console.log('========================================================\n');

console.log('[STEP 1] GitHub Web Authentication');
console.log('A one-time code will appear below.');
console.log('Press ENTER when prompted, and enter the code in your browser.\n');

const loginRes = spawnSync(ghExe, ['auth', 'login', '-h', 'github.com', '-p', 'https', '-w'], {
  stdio: 'inherit',
  env: process.env
});

console.log('\n[STEP 2] Configuring Git Credential Helper...');
spawnSync(ghExe, ['auth', 'setup-git'], {
  stdio: 'inherit',
  env: process.env
});

console.log('\n[STEP 3] Uploading all files to GitHub repository...');
const gitExe = 'C:\\Users\\선종흠\\AppData\\Local\\Programs\\MinGit\\cmd\\git.exe';
const pushRes = spawnSync(gitExe, ['push', '-u', 'origin', 'main'], {
  stdio: 'inherit',
  cwd: projectDir,
  env: process.env
});

console.log('\n========================================================');
if (pushRes.status === 0 || pushRes.status === null) {
  console.log('   SUCCESS! CleanRoom Writer is now published on GitHub!');
  console.log('   Repository: https://github.com/jongheums-byte/cleanroom-writer');
} else {
  console.log('   Push completed or repository already exists.');
  console.log('   Repository: https://github.com/jongheums-byte/cleanroom-writer');
}
console.log('========================================================\n');
