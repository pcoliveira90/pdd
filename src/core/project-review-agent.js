import fs from 'fs';
import path from 'path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const REVIEW_DIR = '.pdd/review';
const REVIEW_FILE = `${REVIEW_DIR}/project-review.md`;
const REVIEW_STATUS_FILE = `${REVIEW_DIR}/project-review-status.json`;
const REVIEW_FEEDBACK_FILE = `${REVIEW_DIR}/project-review-feedback.md`;

const IGNORED_DIRS = new Set([
  '.git',
  '.pdd',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.idea',
  '.vscode'
]);

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function listFiles(rootDir, currentDir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relative = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...listFiles(rootDir, fullPath, depth + 1, maxDepth));
      continue;
    }

    files.push(relative);
  }

  return files;
}

function detectTechnologies(baseDir, files) {
  const tech = new Set();
  const packageJsonPath = path.join(baseDir, 'package.json');
  const pyprojectPath = path.join(baseDir, 'pyproject.toml');
  const requirementsPath = path.join(baseDir, 'requirements.txt');
  const goModPath = path.join(baseDir, 'go.mod');
  const cargoPath = path.join(baseDir, 'Cargo.toml');

  const packageJson = fs.existsSync(packageJsonPath) ? readJson(packageJsonPath) : null;
  if (packageJson) {
    tech.add('Node.js');
    if (packageJson.type === 'module') {
      tech.add('JavaScript (ESM)');
    }
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };

    if (deps.typescript) tech.add('TypeScript');
    if (deps.react) tech.add('React');
    if (deps.next) tech.add('Next.js');
    if (deps.express) tech.add('Express');
    if (deps.vite) tech.add('Vite');
  }

  if (fs.existsSync(pyprojectPath) || fs.existsSync(requirementsPath)) tech.add('Python');
  if (fs.existsSync(goModPath)) tech.add('Go');
  if (fs.existsSync(cargoPath)) tech.add('Rust');

  if (files.some(file => file.endsWith('.sql'))) tech.add('SQL');
  if (files.some(file => file.endsWith('.md'))) tech.add('Documentation-heavy');
  if (files.some(file => file.endsWith('.yml') || file.endsWith('.yaml'))) tech.add('CI/Automation');

  return Array.from(tech);
}

function inferPurpose(baseDir) {
  const packageJson = readJson(path.join(baseDir, 'package.json'));
  if (packageJson?.description) {
    return packageJson.description.trim();
  }

  const readme = safeRead(path.join(baseDir, 'README.md')) || safeRead(path.join(baseDir, 'README.pt-BR.md'));
  if (!readme) {
    return 'Project purpose not explicitly documented.';
  }

  const nonEmpty = readme
    .split('\n')
    .map(line => line.trim())
    .find(line => line.length > 0 && !line.startsWith('#'));

  return nonEmpty || 'Project purpose not explicitly documented.';
}

function pickCoreAreas(files) {
  const rootFolders = new Map();
  for (const file of files) {
    const first = file.split(path.sep)[0];
    if (!first || first.includes('.')) continue;
    rootFolders.set(first, (rootFolders.get(first) || 0) + 1);
  }

  return Array.from(rootFolders.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);
}

function pickKeyFiles(files) {
  const preferred = [
    'README.md',
    'README.pt-BR.md',
    'package.json',
    'pyproject.toml',
    'go.mod',
    'Cargo.toml',
    'src/cli/index.js',
    'src/index.js',
    'src/main.js'
  ];

  const normalized = new Set(files.map(file => file.replace(/\\/g, '/')));
  const first = preferred.filter(file => normalized.has(file));
  const rest = files
    .map(file => file.replace(/\\/g, '/'))
    .filter(file => !first.includes(file))
    .slice(0, 6);

  return [...first, ...rest].slice(0, 10);
}

function buildReport({ purpose, technologies, coreAreas, keyFiles }) {
  return [
    '# Initial Project Review',
    '',
    '## What this project appears to be',
    purpose,
    '',
    '## Main technologies',
    ...(technologies.length > 0 ? technologies.map(item => `- ${item}`) : ['- Not detected']),
    '',
    '## Main areas in repository',
    ...(coreAreas.length > 0 ? coreAreas.map(area => `- ${area}`) : ['- Not detected']),
    '',
    '## Key files inspected by review agent',
    ...(keyFiles.length > 0 ? keyFiles.map(file => `- ${file}`) : ['- Not detected']),
    '',
    '## Reviewer checklist',
    '- [ ] Is the project purpose correct?',
    '- [ ] Are the technologies correct?',
    '- [ ] Are there important modules missing in the summary?',
    ''
  ].join('\n');
}

function printReviewSummary({ purpose, technologies, coreAreas, reportPath }) {
  console.log('');
  console.log('🤖 Initial project review agent');
  console.log(`- Purpose: ${purpose}`);
  console.log(`- Technologies: ${technologies.length > 0 ? technologies.join(', ') : 'Not detected'}`);
  console.log(`- Main areas: ${coreAreas.length > 0 ? coreAreas.join(', ') : 'Not detected'}`);
  console.log(`- Full report: ./${reportPath}`);
}

function parseDecision(answer) {
  const value = answer.trim().toLowerCase();
  if (value === '' || value === 'ok' || value === 'y' || value === 'yes' || value === 's' || value === 'sim') {
    return 'approved';
  }
  if (value === 'a' || value === 'ajustes' || value === 'ajuste' || value === 'adjust') {
    return 'needs-adjustments';
  }
  if (value === 'skip' || value === 'n' || value === 'no') {
    return 'skipped';
  }
  return null;
}

async function askReviewDecision() {
  if (!process.stdin.isTTY) {
    return { status: 'skipped', feedback: null };
  }

  const rl = readline.createInterface({ input, output });
  try {
    console.log('');
    console.log('Project review generated. Please review now:');
    console.log(`- ./${REVIEW_FILE}`);
    console.log('');
    console.log('Type:');
    console.log('  Enter / ok  -> approve');
    console.log('  ajustes / a -> request adjustments');
    console.log('  skip / n    -> skip this step');
    console.log('');

    let answer = await rl.question('> ');
    let status = parseDecision(answer);
    while (status === null) {
      console.log('Invalid option. Use Enter, ok, ajustes, a, skip, or n.');
      answer = await rl.question('> ');
      status = parseDecision(answer);
    }

    if (status !== 'needs-adjustments') {
      return { status, feedback: null };
    }

    console.log('');
    const feedback = await rl.question('Describe the adjustments you want in this review: ');
    return { status, feedback: feedback.trim() || null };
  } finally {
    rl.close();
  }
}

export async function runInitialProjectReviewAgent(baseDir = process.cwd(), argv = process.argv.slice(2)) {
  const files = listFiles(baseDir, baseDir);
  const purpose = inferPurpose(baseDir);
  const technologies = detectTechnologies(baseDir, files);
  const coreAreas = pickCoreAreas(files);
  const keyFiles = pickKeyFiles(files);
  const report = buildReport({ purpose, technologies, coreAreas, keyFiles });

  writeFile(baseDir, REVIEW_FILE, report);
  printReviewSummary({ purpose, technologies, coreAreas, reportPath: REVIEW_FILE });

  if (argv.includes('-y') || argv.includes('--yes') || argv.includes('--no-review-prompt')) {
    writeFile(
      baseDir,
      REVIEW_STATUS_FILE,
      JSON.stringify({ status: 'approved', decidedAt: new Date().toISOString(), feedback: null }, null, 2) + '\n'
    );
    console.log(`✅ Initial review approved automatically: ${REVIEW_FILE}`);
    return { status: 'approved', reportPath: REVIEW_FILE };
  }

  const decision = await askReviewDecision();
  writeFile(
    baseDir,
    REVIEW_STATUS_FILE,
    JSON.stringify(
      {
        status: decision.status,
        decidedAt: new Date().toISOString(),
        feedback: decision.feedback
      },
      null,
      2
    ) + '\n'
  );

  if (decision.feedback) {
    writeFile(
      baseDir,
      REVIEW_FEEDBACK_FILE,
      `# Project Review Feedback\n\n${decision.feedback}\n`
    );
  }

  if (decision.status === 'approved') {
    console.log(`✅ Initial review approved: ${REVIEW_FILE}`);
  } else if (decision.status === 'needs-adjustments') {
    console.log(`📝 Adjustments requested and saved: ${REVIEW_FEEDBACK_FILE}`);
  } else {
    console.log('⏭️ Initial project review was skipped.');
  }

  return { status: decision.status, reportPath: REVIEW_FILE };
}
