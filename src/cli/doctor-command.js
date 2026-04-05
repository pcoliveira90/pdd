import fs from 'fs';
import path from 'path';
import { PDD_TEMPLATE_VERSION } from '../core/template-registry.js';

function exists(baseDir, relativePath) {
  return fs.existsSync(path.join(baseDir, relativePath));
}

function readVersion(baseDir) {
  const file = path.join(baseDir, '.pdd/version.json');
  if (!fs.existsSync(file)) return null;

  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')).templateVersion;
  } catch {
    return null;
  }
}

function print(label, ok, detail = '') {
  const icon = ok ? '✅' : '⚠️';
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ''}`);
}

export function runDoctor(baseDir = process.cwd()) {
  console.log('🩺 PDD Doctor\n');

  const coreChecks = {
    constitution: exists(baseDir, '.pdd/constitution.md'),
    delta: exists(baseDir, '.pdd/templates/delta-spec.md'),
    patch: exists(baseDir, '.pdd/templates/patch-plan.md'),
    verification: exists(baseDir, '.pdd/templates/verification-report.md'),
    memory: exists(baseDir, '.pdd/memory/system-map.md')
  };

  const adapters = {
    claude: exists(baseDir, '.claude/commands/pdd.md'),
    cursor: exists(baseDir, '.cursor/pdd.prompt.md'),
    copilot: exists(baseDir, '.github/copilot/pdd.prompt.md')
  };

  const installedVersion = readVersion(baseDir);

  print('Core constitution', coreChecks.constitution);
  print('Delta spec', coreChecks.delta);
  print('Patch plan', coreChecks.patch);
  print('Verification report', coreChecks.verification);
  print('System map', coreChecks.memory);

  console.log('');

  print('Claude adapter', adapters.claude, adapters.claude ? 'installed' : 'missing');
  print('Cursor adapter', adapters.cursor, adapters.cursor ? 'installed' : 'missing');
  print('Copilot adapter', adapters.copilot, adapters.copilot ? 'installed' : 'missing');

  console.log('');

  if (!installedVersion) {
    console.log('⚠️ No template version detected. Run `pdd init --here --force`.');
  } else if (installedVersion !== PDD_TEMPLATE_VERSION) {
    console.log(`⚠️ Templates outdated (${installedVersion} → ${PDD_TEMPLATE_VERSION})`);
    console.log('👉 Run: pdd init --here --upgrade');
  } else {
    console.log('🎉 Templates up to date');
  }

  if (!adapters.claude && !adapters.cursor && !adapters.copilot) {
    console.log('ℹ️ No IDE adapters installed');
    console.log('👉 Run: pdd init --here --ide=claude (or cursor/copilot)');
  }
}
