import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function exec(command) {
  execSync(command, { stdio: 'inherit' });
}

export async function openPullRequest({ issue, changeId, changeDir }) {
  const branch = `pdd/${changeId}`;
  const title = `fix: ${issue}`;

  fs.writeFileSync(path.join(changeDir, 'pr-title.txt'), title);
  fs.writeFileSync(path.join(changeDir, 'pr-body.md'), issue);

  exec(`git checkout -b ${branch}`);
  exec('git add .');
  exec(`git commit -m "${title}"`);

  console.log('PR ready (use IDE to open)');
}
