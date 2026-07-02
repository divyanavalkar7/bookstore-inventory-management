const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..'); // /home/blubirch/workspace/kpi_task
const backendDir = path.join(rootDir, 'bims_backend');
const nestedBackendDir = path.join(backendDir, 'bims_backend');
const frontendDir = path.join(rootDir, 'bims_frontend');

console.log('Starting repository restructuring...');

// 1. Move nested backend files back to bims_backend root if they exist
if (fs.existsSync(nestedBackendDir)) {
  const files = fs.readdirSync(nestedBackendDir);
  for (const file of files) {
    const src = path.join(nestedBackendDir, file);
    const dest = path.join(backendDir, file);
    fs.renameSync(src, dest);
  }
  fs.rmdirSync(nestedBackendDir);
  console.log('Backend files un-nested.');
}

// Also check for other moved root files in case any other command moved some files
const rootMovedFiles = [
  'app.js', 'config.js', 'database.js', 'package.json', 'package-lock.json', 
  'README.md', '.env', '.sequelizerc', 'migrations', 'models', 'routes', 'seeders', 'node_modules'
];
for (const file of rootMovedFiles) {
  const nestedPath = path.join(backendDir, 'bims_backend', file);
  if (fs.existsSync(nestedPath)) {
    const destPath = path.join(backendDir, file);
    fs.renameSync(nestedPath, destPath);
  }
}

// 2. Remove existing .git folders in subdirectories and root
const gitFolders = [
  path.join(backendDir, '.git'),
  path.join(frontendDir, '.git'),
  path.join(rootDir, '.git')
];

for (const gitFolder of gitFolders) {
  if (fs.existsSync(gitFolder)) {
    fs.rmSync(gitFolder, { recursive: true, force: true });
    console.log(`Removed Git repository: ${gitFolder}`);
  }
}

// 3. Create root .gitignore
const gitignoreContent = `
# Node.js
**/node_modules/
**/npm-debug.log*

# Angular build and cache
**/.angular/
**/dist/

# Environment and sensitive files
**/.env
**/local.properties

# Editor config
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
fs.writeFileSync(path.join(rootDir, '.gitignore'), gitignoreContent.trim());
console.log('Root .gitignore created.');

// 4. Initialize new git repository at root, commit, set remote, and push
try {
  process.chdir(rootDir);
  console.log('Executing git init...');
  execSync('git init', { stdio: 'inherit' });
  console.log('Configuring main branch...');
  execSync('git checkout -b main', { stdio: 'inherit' });
  console.log('Adding files to git...');
  execSync('git add .', { stdio: 'inherit' });
  console.log('Committing files...');
  execSync('git commit -m "Initialize monorepo with backend and frontend"', { stdio: 'inherit' });
  console.log('Adding origin remote...');
  execSync('git remote add origin git@github.com:divyanavalkar7/bookstore-inventory-management.git', { stdio: 'inherit' });
  console.log('Pushing to main branch...');
  execSync('git push -f origin main', { stdio: 'inherit' });
  console.log('Successfully pushed combined backend and frontend to main branch!');
} catch (error) {
  console.error('Error during Git commands:', error);
}
