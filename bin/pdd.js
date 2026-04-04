#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const command = process.argv[2];

if (command === 'init') {
  const targetDir = process.cwd();
  const pddDir = path.join(targetDir, '.pdd');

  if (fs.existsSync(pddDir)) {
    console.log('PDD already initialized.');
    process.exit(0);
  }

  fs.mkdirSync(pddDir, { recursive: true });
  fs.mkdirSync(path.join(pddDir, 'templates'));
  fs.mkdirSync(path.join(pddDir, 'commands'));
  fs.mkdirSync(path.join(pddDir, 'memory'));

  fs.writeFileSync(path.join(pddDir, 'README.md'), 'PDD initialized');

  console.log('✅ PDD initialized successfully.');
} else {
  console.log('Usage: pdd init');
}
