import fs from 'fs';
import path from 'path';
import { CORE_TEMPLATES, IDE_ADAPTERS, PDD_TEMPLATE_VERSION } from '../core/template-registry.js';
import { buildTemplateUpgradePlan, applyTemplateUpgradePlan } from '../core/template-upgrade.js';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function normalizeIdeList(argv) {
  const ideArg = argv.find(arg => arg.startsWith('--ide='));
  if (!ideArg) return [];

  return ideArg
    .split('=')[1]
    ?.split(',')
    .map(v => v.trim())
    .filter(Boolean) || [];
}

function readInstalledVersion(baseDir) {
  const versionFile = path.join(baseDir, '.pdd/version.json');
  if (!fs.existsSync(versionFile)) return null;

  try {
    return JSON.parse(fs.readFileSync(versionFile, 'utf-8')).templateVersion;
  } catch {
    return null;
  }
}

function installIdeAdapters(baseDir, ideList, force) {
  const results = [];

  for (const ide of ideList) {
    const adapter = IDE_ADAPTERS[ide];
    if (!adapter) {
      results.push({ path: `adapter:${ide}`, status: 'unknown' });
      continue;
    }

    for (const [file, content] of Object.entries(adapter)) {
      const fullPath = path.join(baseDir, file);
      if (!force && fs.existsSync(fullPath)) {
        results.push({ path: file, status: 'skipped' });
        continue;
      }

      writeFile(baseDir, file, content);
      results.push({ path: file, status: 'written' });
    }
  }

  return results;
}

function printUpgradeSummary(summary) {
  console.log('⬆️ PDD upgraded');

  summary.created.forEach(f => console.log(`✔️ created: ${f}`));
  summary.updated.forEach(f => console.log(`🔁 updated: ${f}`));
  summary.conflicts.forEach(f => console.log(`⚠️ conflict: ${f}`));
  summary.skipped.forEach(f => console.log(`⏭️ skipped: ${f}`));

  console.log('');
  console.log(`Summary:`);
  console.log(`- created: ${summary.created.length}`);
  console.log(`- updated: ${summary.updated.length}`);
  console.log(`- conflicts: ${summary.conflicts.length}`);
  console.log(`- skipped: ${summary.skipped.length}`);

  if (summary.conflicts.length > 0) {
    console.log('👉 Run with --force to overwrite conflicts');
  }
}

export function runInit(argv = process.argv.slice(2)) {
  const cwd = process.cwd();
  const here = argv.includes('--here');
  const force = argv.includes('--force');
  const upgrade = argv.includes('--upgrade');
  const ideList = normalizeIdeList(argv);

  const projectName = !here && argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
  const baseDir = here ? cwd : path.join(cwd, projectName || 'pdd-project');

  if (!here && !fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const installedVersion = readInstalledVersion(baseDir);

  if (upgrade) {
    const plan = buildTemplateUpgradePlan(baseDir, CORE_TEMPLATES);
    const summary = applyTemplateUpgradePlan(baseDir, CORE_TEMPLATES, plan, force);

    // always update version.json
    writeFile(baseDir, '.pdd/version.json', JSON.stringify({ templateVersion: PDD_TEMPLATE_VERSION }, null, 2));

    printUpgradeSummary(summary);

    if (installedVersion === PDD_TEMPLATE_VERSION) {
      console.log('ℹ️ Templates were already up to date.');
    }

  } else {
    // basic init (no intelligence needed yet)
    for (const [file, content] of Object.entries(CORE_TEMPLATES)) {
      writeFile(baseDir, file, content);
    }

    console.log('🚀 PDD initialized');
  }

  const ideResults = installIdeAdapters(baseDir, ideList, force);
  ideResults.forEach(r => console.log(`- ${r.status}: ${r.path}`));
}
