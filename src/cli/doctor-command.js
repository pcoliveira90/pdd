import fs from 'fs';
import path from 'path';

function checkExists(baseDir, relativePath) {
  return fs.existsSync(path.join(baseDir, relativePath));
}

function printResult(label, ok, detail = '') {
  const icon = ok ? '✅' : '⚠️';
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ''}`);
}

export function runDoctor(baseDir = process.cwd()) {
  console.log('🩺 PDD Doctor');
  console.log('');

  const checks = {
    constitution: checkExists(baseDir, '.pdd/constitution.md'),
    deltaSpec: checkExists(baseDir, '.pdd/templates/delta-spec.md'),
    patchPlan: checkExists(baseDir, '.pdd/templates/patch-plan.md'),
    verification: checkExists(baseDir, '.pdd/templates/verification-report.md'),
    systemMap: checkExists(baseDir, '.pdd/memory/system-map.md'),
    claude: checkExists(baseDir, '.claude/commands/pdd.md'),
    cursor: checkExists(baseDir, '.cursor/pdd.prompt.md'),
    copilot: checkExists(baseDir, '.github/copilot/pdd.prompt.md')
  };

  printResult('Core constitution', checks.constitution);
  printResult('Delta spec template', checks.deltaSpec);
  printResult('Patch plan template', checks.patchPlan);
  printResult('Verification report template', checks.verification);
  printResult('System map', checks.systemMap);
  printResult('Claude adapter', checks.claude, checks.claude ? 'installed' : 'not installed');
  printResult('Cursor adapter', checks.cursor, checks.cursor ? 'installed' : 'not installed');
  printResult('Copilot adapter', checks.copilot, checks.copilot ? 'installed' : 'not installed');

  const coreHealthy = checks.constitution && checks.deltaSpec && checks.patchPlan && checks.verification && checks.systemMap;

  console.log('');
  if (coreHealthy) {
    console.log('🎉 PDD core looks healthy.');
  } else {
    console.log('⚠️ PDD core is incomplete. Run `pdd init --here --force`.');
  }

  if (!checks.claude && !checks.cursor && !checks.copilot) {
    console.log('ℹ️ No IDE adapters detected. Install one with `pdd init --here --ide=claude` (or cursor/copilot).');
  }
}
