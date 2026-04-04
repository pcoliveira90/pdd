import fs from 'fs';
import path from 'path';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function generatePatchArtifacts({ issue, baseDir = process.cwd() }) {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const slug = slugify(issue) || 'change';
  const changeId = `${timestamp}-${slug}`;
  const changeDir = path.join(baseDir, 'changes', changeId);

  const deltaSpec = `# Delta Spec\n\n## Change ID\n${changeId}\n\n## Type\nbugfix\n\n## Context\n${issue}\n\n## Current Behavior\nTBD\n\n## Expected Behavior\nTBD\n\n## Evidence\nTBD\n\n## Root Cause Hypothesis\nTBD\n\n## Impacted Areas\nTBD\n\n## Constraints\nTBD\n\n## Minimal Safe Delta\nTBD\n\n## Alternatives Considered\nTBD\n\n## Acceptance Criteria\nTBD\n\n## Verification Strategy\nTBD\n`;

  const patchPlan = `# Patch Plan\n\n## Files to Inspect\n- TBD\n\n## Files to Change\n- TBD\n\n## Execution Steps\n1. Reproduce issue\n2. Confirm root cause\n3. Apply change\n4. Adjust tests\n5. Run validations\n\n## Regression Risks\n- TBD\n\n## Rollback Strategy\n- TBD\n`;

  const verification = `# Verification Report\n\n## Reproduction\nTBD\n\n## Changes Made\nTBD\n\n## Tests Run\n- TBD\n\n## Manual Validation\nTBD\n\n## Residual Risks\nTBD\n\n## Final Status\npartial\n`;

  writeFile(path.join(changeDir, 'delta-spec.md'), deltaSpec);
  writeFile(path.join(changeDir, 'patch-plan.md'), patchPlan);
  writeFile(path.join(changeDir, 'verification-report.md'), verification);

  return {
    changeId,
    changeDir,
    files: [
      path.join('changes', changeId, 'delta-spec.md'),
      path.join('changes', changeId, 'patch-plan.md'),
      path.join('changes', changeId, 'verification-report.md')
    ]
  };
}
