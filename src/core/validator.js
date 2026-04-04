import fs from 'fs';
import { execSync } from 'child_process';

function runCommand(command) {
  console.log(`→ ${command}`);
  execSync(command, { stdio: 'inherit' });
}

export function runValidation(baseDir = process.cwd()) {
  console.log('Running validation...');

  const packageJsonPath = `${baseDir}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found. Skipping validation.');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const scripts = pkg.scripts || {};
  const commands = [];

  if (scripts.test) commands.push('npm test');
  if (scripts.lint) commands.push('npm run lint');
  if (scripts.build) commands.push('npm run build');

  if (commands.length === 0) {
    console.log('No validation scripts found. Skipping validation.');
    return;
  }

  try {
    commands.forEach(runCommand);
  } catch {
    throw new Error('Validation failed');
  }

  console.log('Validation passed');
}
