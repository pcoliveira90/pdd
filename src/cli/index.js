import fs from 'fs';
import path from 'path';
import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';

const TEMPLATE_FILES = {
  '.pdd/constitution.md': `# PDD Constitution

## 1. Change First
Every task is a change in an existing system.

## 2. Evidence Before Edit
Never change code without understanding current behavior.

## 3. Minimal Safe Delta
Prefer the smallest safe change.

## 4. Root Cause
Fix the cause, not the symptom.

## 5. Regression Awareness
Always consider what can break.

## 6. Reuse Patterns
Prefer existing patterns over new ones.

## 7. Verifiable Outcome
Every change must be validated.
`,
  '.pdd/templates/delta-spec.md': `# Delta Spec

## Change ID

## Type
bugfix | feature | refactor-safe | hotfix

## Context

## Current Behavior

## Expected Behavior

## Evidence

## Root Cause Hypothesis

## Impacted Areas

## Constraints

## Minimal Safe Delta

## Alternatives Considered

## Acceptance Criteria

## Verification Strategy
`,
  '.pdd/templates/patch-plan.md': `# Patch Plan

## Files to Inspect

## Files to Change

## Execution Steps
1. Reproduce issue
2. Confirm root cause
3. Apply change
4. Adjust tests
5. Run validations

## Regression Risks

## Rollback Strategy
`,
  '.pdd/templates/verification-report.md': `# Verification Report

## Reproduction

## Changes Made

## Tests Run

## Manual Validation

## Residual Risks

## Final Status
approved | needs-review | partial
`,
  '.pdd/commands/pdd-recon.md': `# pdd.recon

## Purpose
Understand the current system before making changes.

## Output
- flow mapping
- impacted files
- risks
- unknowns
`,
  '.pdd/commands/pdd-fix.md': `# pdd.fix

## Purpose
Fix bugs with minimal safe delta.

## Steps
1. reproduce issue
2. confirm root cause
3. apply minimal fix
4. validate
`,
  '.pdd/commands/pdd-feature.md': `# pdd.feature

## Purpose
Add features safely in existing systems.

## Steps
1. understand current behavior
2. define minimal extension
3. ensure compatibility
4. validate
`,
  '.pdd/commands/pdd-verify.md': `# pdd.verify

## Purpose
Validate changes and ensure safety.

## Checklist
- tests pass
- no regression detected
- expected behavior confirmed
`,
  '.pdd/memory/system-map.md': `# System Map

## Purpose
Map the structure of the system.

## Modules
- 

## Entry Points
- 

## Dependencies
- 

## Hotspots
- 
`
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

function parseFixArgs(argv) {
  const issue = argv
    .filter(arg => !arg.startsWith('--') && arg !== 'fix')
    .join(' ')
    .trim();

  return {
    issue,
    openPr: argv.includes('--open-pr'),
    dryRun: argv.includes('--dry-run'),
    noValidate: argv.includes('--no-validate')
  };
}

export async function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const force = argv.includes('--force');
  const cwd = process.cwd();

  if (command === 'init') {
    const results = Object.entries(TEMPLATE_FILES).map(([file, content]) =>
      writeFileSafe(cwd, file, content, force)
    );

    console.log('🚀 PDD initialized');
    results.forEach(result => console.log(`- ${result.status}: ${result.path}`));
    return;
  }

  if (command === 'fix') {
    const { issue, openPr, dryRun, noValidate } = parseFixArgs(argv);

    if (!issue) {
      console.error('❌ Missing issue description.');
      console.log('Use: pdd fix "description" [--open-pr] [--dry-run] [--no-validate]');
      process.exit(1);
    }

    console.log('🔧 PDD Fix Workflow');
    console.log(`Issue: ${issue}`);
    console.log(`Open PR prep: ${openPr ? 'yes' : 'no'}`);
    console.log(`Dry run: ${dryRun ? 'yes' : 'no'}`);
    console.log(`Validation: ${noValidate ? 'skipped' : 'enabled'}`);

    if (dryRun) {
      console.log('📝 Dry run only. No files created.');
      return;
    }

    const patch = generatePatchArtifacts({ issue, baseDir: cwd });

    console.log('🧩 Patch artifacts created:');
    patch.files.forEach(file => console.log(`- ${file}`));

    if (!noValidate) {
      runValidation(cwd);
    }

    if (openPr) {
      await openPullRequest({
        issue,
        changeId: patch.changeId,
        changeDir: patch.changeDir,
        baseDir: cwd
      });
    }

    console.log('✅ Fix workflow finished.');
    return;
  }

  if (command === 'help' || !command) {
    console.log('PDD CLI');
    console.log('');
    console.log('Commands:');
    console.log('  pdd init [--force]');
    console.log('  pdd fix "description" [--open-pr] [--dry-run] [--no-validate]');
    console.log('');
    return;
  }

  console.log(`Unknown command: ${command}`);
  console.log('Use: pdd help');
}
