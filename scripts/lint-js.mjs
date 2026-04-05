import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = process.cwd();
const TARGET_DIRS = ['bin', 'src', 'scripts', 'test'];

function collectJsFiles(startDir) {
  if (!fs.existsSync(startDir)) return [];
  const results = [];
  const stack = [startDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const files = TARGET_DIRS.flatMap(dir => collectJsFiles(path.join(ROOT, dir)));
let failed = false;

for (const file of files) {
  try {
    execFileSync('node', ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    failed = true;
    const relative = path.relative(ROOT, file);
    const stderr = error.stderr?.toString() || error.message;
    console.error(`\n[lint] Syntax check failed: ${relative}\n${stderr}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`[lint] OK (${files.length} files checked)`);
}
