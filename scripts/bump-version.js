const fs = require('fs');
const path = require('path');

const appJsonPath = path.resolve(__dirname, '../app.json');
const packageJsonPath = path.resolve(__dirname, '../package.json');

function bumpVersion() {
  try {
    // Read app.json
    const appJsonRaw = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(appJsonRaw);
    
    const currentVersion = appJson.expo.version;
    const versionParts = currentVersion.split('.').map(Number);
    
    // Increment patch version
    versionParts[2] += 1;
    const newVersion = versionParts.join('.');
    
    // Update app.json
    appJson.expo.version = newVersion;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    
    console.log(`Bumped expo.version from ${currentVersion} to ${newVersion} in app.json`);

    // Update package.json version to match (good practice)
    const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonRaw);
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Synced version to package.json`);

  } catch (error) {
    console.error('Error bumping version:', error);
    process.exit(1);
  }
}

bumpVersion();
