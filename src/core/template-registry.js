export const PDD_TEMPLATE_VERSION = '0.3.2';

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

## 8. Business Rule Integrity
Never break core business rules while fixing or extending behavior.

## 9. Usability First
Every change must preserve or improve user experience and task flow.

## 10. Security by Default
Every change must evaluate security impact before implementation.

## 11. Worktree First for Tasks
When starting implementation tasks (for example, bug fixes), prefer a linked worktree over the primary worktree.
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

## Business Rules Impact

## Usability Impact

## Security Impact

## Structural Impact Risks
- database/schema/data migration impact
- API/event contract compatibility impact
- rollout/rollback complexity impact

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

## Business Rules Risks

## Usability Risks

## Security Risks

## Structural Impact Risks
- database/schema/data migration impact
- API/event contract compatibility impact
- rollout/rollback complexity impact

## Rollback Strategy
`,
  '.pdd/templates/verification-report.md': `# Verification Report

## Reproduction

## Changes Made

## Tests Run

## Test Coverage
- minimum threshold:
- measured result:
- status: pass | fail | not-available

## Business Rule Validation

## Usability Validation

## Security Validation

## Manual Validation

## Residual Risks

## Final Status
approved | needs-review | partial
`,
  '.pdd/templates/gaps-report.md': `# Gaps Report

## Task Mapping

## Automatic Gap Check Summary

## Gaps by Severity
- critical:
- high:
- medium:

## Mitigation Plan

## Reviewer Decision
- approved: yes | no
- notes:
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
  '.pdd/memory/model-routing.md': `# Model Routing

## Goal
Pick the most suitable AI model for each task type.

## Task-to-Model Guidance
- analysis/recon: prefer a more capable model for deep reasoning
- implementation/build: prefer balanced model (quality + speed)
- tests/coverage: prefer fast model for iterative feedback loops
- review/risk/security: prefer a more capable model for edge cases

## Decision Rule
1. If model can be set automatically in this environment, set it by task type.
2. If model cannot be set automatically, suggest the best model to the user.
3. Ask for confirmation before continuing when model choice impacts quality/speed.

## Output Requirement
- chosen model profile
- reason for choice
- fallback suggested to user (if auto-selection is unavailable)
`,
  '.pdd/work-items/README.md': `# Work Items Registry

PDD stores concise and editable records here:
- plans/
- changes/
- features/

Each change should include:
- proposal (user can edit)
- decision (approval and notes)
- plan (execution and validation)
`,
  '.pdd/work-items/plans/.gitkeep': ``,
  '.pdd/work-items/changes/.gitkeep': ``,
  '.pdd/work-items/features/.gitkeep': ``,
  '.pdd/version.json': JSON.stringify({ templateVersion: PDD_TEMPLATE_VERSION }, null, 2) + '\n'
};

export const IDE_ADAPTERS = {
  claude: {
    '.claude/CLAUDE.md': `# PDD for Claude Code

This repository uses Patch-Driven Development (PDD).

Operational command guidance lives in:
- .claude/commands/pdd.md
- .claude/commands/pdd-recon.md
- .claude/commands/pdd-fix.md
- .claude/commands/pdd-feature.md
- .claude/commands/pdd-verify.md
`,
    '.claude/commands/pdd.md': `# /pdd

## Goal
Execute Patch-Driven Development workflow.

## Usage
/pdd <issue-or-goal>
`,
    '.claude/commands/pdd-recon.md': `# /pdd-recon

## Goal
Explore the system before editing.

## Deliver
- concise context map
- key files
- risks/unknowns
`,
    '.claude/commands/pdd-fix.md': `# /pdd-fix

## Goal
Fix bug with minimal safe delta.

## Required flow
1. map current vs expected behavior
2. identify root cause
3. present concise editable proposal
4. ask explicit user approval
5. implement and validate
`,
    '.claude/commands/pdd-feature.md': `# /pdd-feature

## Goal
Add feature safely in existing system.

## Required flow
1. map context and business rules
2. present concise editable proposal
3. ask explicit user approval
4. implement and validate
`,
    '.claude/commands/pdd-verify.md': `# /pdd-verify

## Goal
Verify changes and residual risks.

## Checklist
- tests and coverage
- regression risks
- business rule validation
- usability/security validation
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
- For \`bugfix\` and \`feature\`, do not edit files before presenting context, business rules, risks, and plan, then waiting for explicit user approval.
- Choose model by task type whenever possible (analysis/build/tests/review). If auto model switch is unavailable, suggest model to user and ask confirmation.
- For implementation tasks, use linked git worktrees when needed (for example, \`pdd fix\`). Avoid changing code from primary worktree when auto-relocation is available.

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
- For \`bugfix\` and \`feature\`, always stop for explicit user approval before any file edits.

## User request

$ARGUMENTS

(If empty, ask what issue or goal to work on.)

## What to do

1. Keep response concise and practical.
2. Classify: bugfix vs feature vs recon.
3. Map context + business rules (only essential points).
4. Map key risks (regression, structural, usability, security).
5. Run automatic gap check after task mapping.
6. Present a concise proposal and ask the user to edit if needed.
7. Ask explicit approval before any file edits.
8. After approval, implement and validate.

## Output

Use this exact structure:
1) Classification
2) Context map
3) Business rules
4) Risks and structural impact
5) Concise proposal (editable by user)
6) Verification plan
7) Automatic gap check
8) Pending approval (explicit question)
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
- Suggested model profile for next phase (analysis/build/tests/review)
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

### Phase 1 — Investigation (no edits)
1. Reproduce or infer current vs expected behavior (code/tests).
2. Confirm root cause (not only symptoms).
3. Map context (data flow, integrations, impacted modules/files).
4. List business rules and constraints.
5. Analyze usability impact (journeys, friction, discoverability).
6. Analyze security impact (auth, authz, data exposure, abuse vectors).
7. Build risk map (regression, data/contract, performance/ops, usability, security).
   - Flag structural-impact actions explicitly (database/schema/migrations/contracts).
8. Run automatic gap check immediately after task mapping and risk mapping.
9. Present concise proposal and allow user edits.
10. Ask explicit approval before editing files.

### Phase 2 — Plan (no edits)
11. Propose minimal safe delta and alternatives considered.
12. Define verification plan (tests + manual checks + rollback).

### Phase 3 — Execution (after approval)
13. Implement approved minimal change.
14. Validate and report residual risks.

## Output

Use this exact structure:
1) Current vs expected behavior
2) Root cause
3) Context map
4) Business rules
5) Risks and structural impact
6) Concise proposal (editable by user)
7) Verification + coverage plan
8) Automatic gap check
9) Pending approval (explicit question)

After approval:
10) Files changed
11) Validation results
12) Residual risks
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

### Phase 1 — Discovery (no edits)
1. Understand current behavior and extension points.
2. Map context (user journey, modules/files, contracts, dependencies).
3. List business rules and acceptance constraints.
4. Analyze usability impact (journeys, accessibility, adoption friction).
5. Analyze security impact (permissions, data exposure, misuse scenarios).
6. Build risk map (compatibility, regression, data, performance, operational, usability, security).
   - Flag structural-impact actions explicitly (database/schema/migrations/contracts).
7. Run automatic gap check immediately after task mapping and risk mapping.
8. Present concise proposal and allow user edits.
9. Ask explicit approval before editing files.

### Phase 2 — Plan (no edits)
10. Define smallest safe extension and non-goals.
11. Propose verification and rollback strategy.

### Phase 3 — Execution (after approval)
12. Implement approved scope.
13. Validate compatibility and report residual risks.

## Output

Use this exact structure:
1) Feature scope
2) Context map
3) Business rules
4) Risks and structural impact
5) Concise proposal (editable by user)
6) Verification + coverage + rollback plan
7) Automatic gap check
8) Pending approval (explicit question)

After approval:
9) Files changed
10) Validation results
11) Residual risks
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
- Model used for review and why

## Output

- Pass/fail summary
- What you would still verify before merge
`
  },
  copilot: {
    '.github/copilot-instructions.md': `# PDD Instructions for GitHub Copilot

Use Patch-Driven Development (PDD) in this repository.

Before edits:
- map context and business rules
- map risks and unknowns
- propose concise plan and ask for user approval

After edits:
- validate tests/coverage
- report residual risks
`,
    '.github/copilot/pdd.prompt.md': `# PDD Copilot Prompt

You are executing a Patch-Driven Development workflow.
`,
    '.github/prompts/pdd-recon.prompt.md': `# PDD Recon Prompt

Map the relevant system area before editing:
- context
- key files
- risks
- unknowns
`,
    '.github/prompts/pdd-fix.prompt.md': `# PDD Fix Prompt

Fix with minimal safe delta:
1. identify root cause
2. propose concise editable plan
3. ask for user approval
4. implement and validate
`,
    '.github/prompts/pdd-feature.prompt.md': `# PDD Feature Prompt

Implement feature safely:
1. map context/business rules
2. propose concise editable plan
3. ask for user approval
4. implement and validate
`,
    '.github/prompts/pdd-verify.prompt.md': `# PDD Verify Prompt

Validate:
- tests and coverage
- regression and structural risks
- business rule/usability/security checks
`
  }
};
