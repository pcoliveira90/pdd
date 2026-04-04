import fs from 'fs';
import path from 'path';

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
- unit
- integration
- e2e
- lint
- typecheck

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

export function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const force = argv.includes('--force');
  const cwd = process.cwd();

  if (command === 'init') {
    const results = Object.entries(TEMPLATE_FILES).map(([file, content]) =>
      writeFileSafe(cwd, file, content, force)
    );

    console.log('🚀 PDD initialized');
    for (const result of results) {
      console.log(`- ${result.status}: ${result.path}`);
    }
    return;
  }

  if (command === 'help' || !command) {
    console.log('PDD CLI');
    console.log('Usage: pdd init [--force]');
    return;
  }

  console.log(`Unknown command: ${command}`);
  console.log('Usage: pdd init [--force]');
}
