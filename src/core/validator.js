import { execSync } from 'child_process';

export function runValidation() {
  console.log('Running validation...');

  try {
    execSync('npm test', { stdio: 'inherit' });
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (err) {
    throw new Error('Validation failed');
  }

  console.log('Validation passed');
}
