import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

function runGit(args, baseDir = process.cwd()) {
  execFileSync('git', args, { stdio: 'inherit', cwd: baseDir });
}

export async function openPullRequest({ issue, changeId, changeDir, baseDir = process.cwd() }) {
  const branch = `pdd/${changeId}`;
  const title = `fix: ${issue}`;

  fs.writeFileSync(path.join(changeDir, 'pr-title.txt'), title);
  fs.writeFileSync(path.join(changeDir, 'pr-body.md'), issue);

  runGit(['checkout', '-b', branch], baseDir);
  runGit(['add', '.'], baseDir);
  runGit(['commit', '-m', title], baseDir);

  console.log('PR ready (use IDE to open)');
}
