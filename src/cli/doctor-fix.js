import fs from 'fs';
import path from 'path';
import { CORE_TEMPLATES, PDD_TEMPLATE_VERSION } from '../core/template-registry.js';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function readInstalledVersion(baseDir) {
  const versionFile = path.join(baseDir, '.pdd/version.json');
  if (!fs.existsSync(versionFile)) return null;

  try {
    return JSON.parse(fs.readFileSync(versionFile, 'utf-8')).templateVersion || null;
  } catch {
    return null;
  }
}

function isCoreFile(relativePath) {
  return relativePath.startsWith('.pdd/');
}

export function runDoctorFix(baseDir = process.cwd()) {
  const installedVersion = readInstalledVersion(baseDir);
  const repaired = [];

  for (const [relativePath, content] of Object.entries(CORE_TEMPLATES)) {
    const fullPath = path.join(baseDir, relativePath);
    const missing = !fs.existsSync(fullPath);
    const outdatedVersionFile = relativePath === '.pdd/version.json' && installedVersion !== PDD_TEMPLATE_VERSION;

    if (isCoreFile(relativePath) && (missing || outdatedVersionFile)) {
      writeFile(baseDir, relativePath, content);
      repaired.push(relativePath);
    }
  }

  return {
    repaired,
    installedVersion,
    currentVersion: PDD_TEMPLATE_VERSION,
    changed: repaired.length > 0
  };
}
