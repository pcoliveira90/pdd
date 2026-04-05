import fs from 'fs';
import path from 'path';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function write(baseDir, file, content, force) {
  const full = path.join(baseDir, file);
  if (!force && fs.existsSync(full)) return;
  ensureDir(full);
  fs.writeFileSync(full, content);
}

function installCore(baseDir, force) {
  write(baseDir, '.pdd/constitution.md', '# PDD Constitution', force);
  write(baseDir, '.pdd/templates/delta-spec.md', '# Delta Spec', force);
  write(baseDir, '.pdd/templates/patch-plan.md', '# Patch Plan', force);
  write(baseDir, '.pdd/templates/verification-report.md', '# Verification', force);
  write(baseDir, '.pdd/memory/system-map.md', '# System Map', force);
}

function installClaude(baseDir, force) {
  write(baseDir, '.claude/commands/pdd.md', '# /pdd command', force);
}

function installCursor(baseDir, force) {
  write(baseDir, '.cursor/pdd.prompt.md', '# PDD Cursor Prompt', force);
}

function installCopilot(baseDir, force) {
  write(baseDir, '.github/copilot/pdd.prompt.md', '# PDD Copilot Prompt', force);
}

export function runInit(argv) {
  const cwd = process.cwd();

  const here = argv.includes('--here');
  const force = argv.includes('--force');

  const ideArg = argv.find(a => a.startsWith('--ide'));
  const ideList = ideArg ? ideArg.split('=')[1]?.split(',') : [];

  const projectName = !here && argv[1] ? argv[1] : null;

  const baseDir = here ? cwd : path.join(cwd, projectName || 'pdd-project');

  if (!here && projectName && !fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  installCore(baseDir, force);

  if (ideList?.includes('claude')) installClaude(baseDir, force);
  if (ideList?.includes('cursor')) installCursor(baseDir, force);
  if (ideList?.includes('copilot')) installCopilot(baseDir, force);

  console.log('PDD initialized');
  console.log('Path:', baseDir);
  if (ideList?.length) console.log('IDEs:', ideList.join(','));
}
