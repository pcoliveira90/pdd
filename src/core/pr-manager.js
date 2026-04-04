import { execSync } from 'child_process';

function exec(command) {
  console.log(`→ ${command}`);
  execSync(command, { stdio: 'inherit' });
}

export async function openPullRequest({ title }) {
  console.log('Creating branch and commit...');

  const branch = `pdd/${Date.now()}`;

  exec(`git checkout -b ${branch}`);
  exec('git add .');
  exec(`git commit -m "${title}"`);
  exec(`git push origin ${branch}`);

  console.log('Branch pushed. Open PR manually or integrate GitHub API next.');
}
