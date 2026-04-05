import fs from 'fs';
import { execSync } from 'child_process';

const file = 'CHANGELOG.md';
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = packageJson.version;
const date = new Date().toISOString().slice(0, 10);
const versionHeader = `## v${version} - ${date}`;

function run(command) {
  return execSync(command, { stdio: 'pipe', encoding: 'utf-8' }).trim();
}

function getTaggedCommitRange() {
  try {
    const latestTag = run('git describe --tags --abbrev=0');
    try {
      const previousTag = run(`git describe --tags --abbrev=0 ${latestTag}^`);
      return `${previousTag}..${latestTag}`;
    } catch {
      return latestTag;
    }
  } catch {
    return null;
  }
}

function collectCommitLines() {
  const range = getTaggedCommitRange();
  const parseLines = output => output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.includes('chore(release):'))
    .filter(line => !line.includes('docs: update changelog'));

  const primaryOutput = run(
    range ? `git log ${range} --pretty=format:"%h %s"` : 'git log --pretty=format:"%h %s" -n 20'
  );
  const primaryLines = parseLines(primaryOutput);
  if (primaryLines.length > 0) {
    return primaryLines;
  }

  // Fallback to latest commits when tagged range has only maintenance commits.
  return parseLines(run('git log --pretty=format:"%h %s" -n 20'));
}

function toBullet(line) {
  if (line.includes('feat')) return `- ✨ ${line}`;
  if (line.includes('fix')) return `- 🐛 ${line}`;
  if (line.includes('docs')) return `- 📝 ${line}`;
  return `- ${line}`;
}

function buildSection(commitLines) {
  const body = commitLines.length > 0
    ? commitLines.map(toBullet).join('\n')
    : '- No user-facing changes recorded for this release.';
  return `${versionHeader}\n\n${body}\n`;
}

let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '# Changelog\n';
if (!content.startsWith('# Changelog')) {
  content = `# Changelog\n\n${content}`;
}

if (content.includes(`## v${version} - `)) {
  console.log(`Changelog already contains version v${version}.`);
  process.exit(0);
}

const section = buildSection(collectCommitLines());
const trimmed = content.trimEnd();
const nextContent = `${trimmed}\n\n${section}\n`;
fs.writeFileSync(file, nextContent, 'utf-8');
console.log(`Changelog updated with ${versionHeader}`);
