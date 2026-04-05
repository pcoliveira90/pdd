import fs from 'fs';
import path from 'path';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readFileOrNull(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

export function buildTemplateUpgradePlan(baseDir, templates) {
  const plan = {
    created: [],
    conflicts: [],
    skipped: []
  };

  for (const [relativePath, templateContent] of Object.entries(templates)) {
    const fullPath = path.join(baseDir, relativePath);
    const currentContent = readFileOrNull(fullPath);

    if (currentContent === null) {
      plan.created.push(relativePath);
      continue;
    }

    if (currentContent === templateContent) {
      plan.skipped.push(relativePath);
      continue;
    }

    plan.conflicts.push(relativePath);
  }

  return plan;
}

export function applyTemplateUpgradePlan(baseDir, templates, plan, force = false) {
  const summary = {
    created: [],
    updated: [],
    conflicts: [...plan.conflicts],
    skipped: [...plan.skipped]
  };

  for (const relativePath of plan.created) {
    writeFile(baseDir, relativePath, templates[relativePath]);
    summary.created.push(relativePath);
  }

  if (force) {
    for (const relativePath of plan.conflicts) {
      writeFile(baseDir, relativePath, templates[relativePath]);
      summary.updated.push(relativePath);
    }
    summary.conflicts = [];
  }

  return summary;
}
