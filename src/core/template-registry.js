export const PDD_TEMPLATE_VERSION = '0.2.1';

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

## Scope
Summary only. For operational guidance in Cursor, use \`.cursor/commands/pdd-recon.md\`.

## Output
- flow mapping
- impacted files
- risks
- unknowns
`,
  '.pdd/commands/pdd-fix.md': `# pdd.fix

## Purpose
Fix bugs with minimal safe delta.

## Scope
Summary only. For operational guidance in Cursor, use \`.cursor/commands/pdd-fix.md\`.

## Steps
1. reproduce issue
2. confirm root cause
3. apply minimal fix
4. validate
`,
  '.pdd/commands/pdd-feature.md': `# pdd.feature

## Purpose
Add features safely in existing systems.

## Scope
Summary only. For operational guidance in Cursor, use \`.cursor/commands/pdd-feature.md\`.

## Steps
1. understand current behavior
2. define minimal extension
3. ensure compatibility
4. validate
`,
  '.pdd/commands/pdd-verify.md': `# pdd.verify

## Purpose
Validate changes and ensure safety.

## Scope
Summary only. For operational guidance in Cursor, use \`.cursor/commands/pdd-verify.md\`.

## Checklist
- tests pass
- no regression detected
- expected behavior confirmed
`,
  '.pdd/commands/README.md': `# PDD Commands (Summary)

Files in this directory are concise summaries of each workflow command.

When using Cursor, the operational source of truth is:
- \`.cursor/commands/pdd.md\`
- \`.cursor/commands/pdd-recon.md\`
- \`.cursor/commands/pdd-fix.md\`
- \`.cursor/commands/pdd-feature.md\`
- \`.cursor/commands/pdd-verify.md\`
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
  '.pdd/version.json': JSON.stringify({ templateVersion: '0.2.1' }, null, 2) + '\n'
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
    '.cursor/rules/pdd.mdc': `---
description: PDD — Patch-Driven Development context for this repo (like Spec Kit project rules)
alwaysApply: true
---

# Patch-Driven Development

This repo uses **PDD**: safe changes in existing systems. The agent should:

- Read \`.pdd/constitution.md\` before substantive edits.
- Prefer **minimal safe deltas**; avoid drive-by refactors.
- Use templates under \`.pdd/templates/\` when producing specs or reports (\`delta-spec\`, \`patch-plan\`, \`verification-report\`).
- Follow playbooks under \`.pdd/commands/\` when the user invokes a PDD slash command.

Slash commands live in \`.cursor/commands/\` (type \`/\` in Chat/Agent). They are the primary operational guidance for Cursor.
`,
    '.cursor/commands/pdd.md': `---
description: "PDD — main workflow (Patch-Driven Development)"
argument-hint: "[issue or goal]"
---

# PDD — main workflow

You are running **Patch-Driven Development** in this repository.

## Ground rules

- Obey \`.pdd/constitution.md\`.
- Evidence before edits: locate behavior in code/tests before changing.
- Smallest change that solves the problem; match local patterns.

## User request

$ARGUMENTS

(If empty, ask what issue or goal to work on.)

## What to do

1. Classify: bugfix vs feature vs exploration-only (**recon**).
2. Name impacted files and risks.
3. Propose a minimal plan, then implement or outline next steps.
4. Say how to verify (tests, manual steps).

## Output

- Files touched or to touch
- Risks and what you did not change on purpose
`,
    '.cursor/commands/pdd-recon.md': `---
description: "PDD — recon (explore before editing)"
argument-hint: "[area or question]"
---

# PDD — recon

**Exploration only** unless the user asks to edit.

## Goal

Map the relevant part of the system before any change. Align with \`.pdd/commands/pdd-recon.md\`.

## User focus

$ARGUMENTS

## Deliver

- Short map: entry points, key modules, data flow if useful
- List of files worth reading next
- Risks and unknowns
- No production edits unless the user explicitly asked to fix something
`,
    '.cursor/commands/pdd-fix.md': `---
description: "PDD — fix (minimal bugfix)"
argument-hint: "[bug description]"
---

# PDD — fix

Fix a **bug** with a minimal safe delta. Align with \`.pdd/commands/pdd-fix.md\`.

## Issue

$ARGUMENTS

## Steps

1. Reproduce or infer current vs expected behavior (code/tests).
2. Confirm root cause (not only symptoms).
3. Apply the smallest fix; avoid scope creep.
4. State how to verify (tests or manual).

## Output

- Root cause (brief)
- Files changed
- Verification steps
`,
    '.cursor/commands/pdd-feature.md': `---
description: "PDD — feature (safe extension)"
argument-hint: "[feature request]"
---

# PDD — feature

Add behavior **safely** in an existing system. Align with \`.pdd/commands/pdd-feature.md\`.

## Request

$ARGUMENTS

## Steps

1. Understand current behavior and extension points.
2. Define the smallest extension (APIs, files).
3. Implement without breaking existing callers.
4. Verification and rollback idea.

## Output

- Design note (what you extended and why)
- Files changed
- Tests or checks to run
`,
    '.cursor/commands/pdd-verify.md': `---
description: "PDD — verify (validation checklist)"
argument-hint: "[scope or PR]"
---

# PDD — verify

Validate a change or the current state. Align with \`.pdd/commands/pdd-verify.md\`.

## Scope

$ARGUMENTS

## Checklist

- Tests run (which)
- Regressions considered
- Manual checks if needed
- Residual risks

## Output

- Pass/fail summary
- What you would still verify before merge
`
  },
  copilot: {
    '.github/copilot/pdd.prompt.md': `# PDD Copilot Prompt

You are executing a Patch-Driven Development workflow.
`
  }
};
