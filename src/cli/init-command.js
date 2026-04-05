import fs from 'fs';
import path from 'path';
import { CORE_TEMPLATES, IDE_ADAPTERS, PDD_TEMPLATE_VERSION } from '../core/template-registry.js';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(baseDir, relativePath, content, force = false) {
  const fullPath = path.join(baseDir, relativePath);
  if (!force && fs.existsSync(fullPath)) {
    return { path: relativePath, status: 'skipped' };
  }

  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
  return { path: relativePath, status: fs.existsSync(fullPath) ? 'written' : 'created' };
}

function normalizeIdeList(argv) {
  const ideArg = argv.find(arg => arg.startsWith('--ide='));
  if (!ideArg) return [];

  return ideArg
    .split('=')[1]
    ?.split(',')
    .map(value => value.trim())
    .filter(Boolean) || [];
}

function readInstalledVersion(baseDir) {
  const versionFile = path.join(baseDir, '.pdd/version.json');
  if (!fs.existsSync(versionFile)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
    return raw.templateVersion || null;
  } catch {
    return null;
  }
}

function installCore(baseDir, force) {
  return Object.entries(CORE_TEMPLATES).map(([file, content]) =>
    writeFile(baseDir, file, content, force)
  );
}

function installIdeAdapters(baseDir, force, ideList) {
  const results = [];

  for (const ide of ideList) {
    const adapter = IDE_ADAPTERS[ide];
    if (!adapter) {
      results.push({ path: `adapter:${ide}`, status: 'unknown' });
      continue;
    }

    for (const [file, content] of Object.entries(adapter)) {
      results.push(writeFile(baseDir, file, content, force));
    }
  }

  return results;
}

function printSummary(baseDir, installedVersion, ideList, results, mode) {
  console.log(mode === 'upgrade' ? '⬆️ PDD upgraded' : '🚀 PDD initialized');
  console.log(`Path: ${baseDir}`);
  console.log(`Template version: ${PDD_TEMPLATE_VERSION}`);
  if (installedVersion && mode === 'upgrade') {
    console.log(`Previous version: ${installedVersion}`);
  }
  if (ideList.length) {
    console.log(`IDEs: ${ideList.join(', ')}`);
  }

  for (const result of results) {
    console.log(`- ${result.status}: ${result.path}`);
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
  const overwrite = force || upgrade;

  const coreResults = installCore(baseDir, overwrite);
  const ideResults = installIdeAdapters(baseDir, overwrite, ideList);

  printSummary(baseDir, installedVersion, ideList, [...coreResults, ...ideResults], upgrade ? 'upgrade' : 'init');

  if (upgrade && installedVersion === PDD_TEMPLATE_VERSION) {
    console.log('ℹ️ Templates were already up to date.');
  }
}
