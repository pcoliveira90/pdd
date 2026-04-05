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
    '.cursor/pdd.prompt.md': `# PDD (Cursor)

You are helping run **Patch-Driven Development** in this repo. Prefer small, safe changes and evidence before edits.

## Context to use

- Project rules: \`.pdd/constitution.md\`
- Command playbooks: \`.pdd/commands/\` (e.g. \`pdd-fix.md\`, \`pdd-verify.md\`)
- Templates: \`.pdd/templates/\` (delta-spec, patch-plan, verification-report)

## Workflow (high level)

1. **Recon** — map relevant files and risks; do not edit yet.
2. **Delta** — describe the minimal change (align with \`delta-spec\` / \`patch-plan\` ideas).
3. **Implement** — smallest diff that fixes the issue; match existing patterns.
4. **Verify** — how to confirm behavior; note regressions avoided or checked.
5. **Artifacts** — if the project uses \`changes/\` or PR notes, keep them consistent.

## Issue to address

Describe the issue or paste it here:

\`\`\`
{{issue}}
\`\`\`

## Output

- Clear list of files touched and why
- If something is unknown, say what you would verify next (command, test, or manual step)
`
  },
  copilot: {
    '.github/copilot/pdd.prompt.md': `# PDD Copilot Prompt

You are executing a Patch-Driven Development workflow.
`
  }
};
