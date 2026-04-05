export const PDD_TEMPLATE_VERSION = '0.2.0';

export const CORE_TEMPLATES = {
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
`,
  '.pdd/version.json': JSON.stringify({ templateVersion: '0.2.0' }, null, 2) + '\n'
};

export const IDE_ADAPTERS = {
  claude: {
    '.claude/commands/pdd.md': `# /pdd

## Goal
Execute Patch-Driven Development workflow.

## Usage
/pdd fix <issue>
`
  },
  cursor: {
    '.cursor/pdd.prompt.md': `# PDD Cursor Prompt

Goal: execute PDD workflow for a given issue.
`
  },
  copilot: {
    '.github/copilot/pdd.prompt.md': `# PDD Copilot Prompt

You are executing a Patch-Driven Development workflow.
`
  }
};
