import fs from 'fs';
import path from 'path';
import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';

const TEMPLATE_FILES = {
  '.pdd/constitution.md': `# PDD Constitution`,
  '.pdd/templates/delta-spec.md': `# Delta Spec`,
  '.pdd/templates/patch-plan.md': `# Patch Plan`,
  '.pdd/templates/verification-report.md': `# Verification Report`,
  '.pdd/memory/system-map.md': `# System Map`
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFileSafe(baseDir, relativePath, content, force = false) {
  const fullPath = path.join(baseDir, relativePath);
  if (!force && fs.existsSync(fullPath)) {
    return { path: relativePath, status: 'skipped' };
  }
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
  return { path: relativePath, status: 'created' };
}

export async function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const cwd = process.cwd();

  if (command === 'init') {
    Object.entries(TEMPLATE_FILES).forEach(([file, content]) => writeFileSafe(cwd, file, content));
    console.log('PDD initialized');
    return;
  }

  if (command === 'fix') {
    const issue = argv.filter(a => !a.startsWith('--') && a !== 'fix').join(' ');

    const patch = generatePatchArtifacts({ issue });

    console.log('Patch created:', patch.files);

    runValidation();

    if (argv.includes('--open-pr')) {
      await openPullRequest({ title: `fix: ${issue}`, body: issue });
    }

    return;
  }

  console.log('Usage: pdd init | pdd fix');
}
