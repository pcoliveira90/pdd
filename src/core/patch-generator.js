import fs from 'fs';
import path from 'path';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf-8');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
function renderStructuralRiskSection(riskAssessment) {
  if (!riskAssessment?.hasHighRisk) {
    return 'No high structural impact signals detected from issue description.';
  }

  const lines = [];
  for (const hit of riskAssessment.hits) {
    lines.push(`- ${hit.label} (${hit.id})`);
  }
  return lines.join('\n');
}

function renderGapCheckSection(gapCheck) {
  if (!gapCheck || gapCheck.summary.total === 0) {
    return '- status: ok\n- notes: no automatic gaps detected';
  }

  const lines = [
    `- status: ${gapCheck.summary.status}`,
    `- total: ${gapCheck.summary.total}`,
    `- critical: ${gapCheck.summary.critical}`,
    `- high: ${gapCheck.summary.high}`
  ];

  for (const gap of gapCheck.gaps) {
    lines.push(`- [${gap.severity}] ${gap.title}`);
    lines.push(`  recommendation: ${gap.recommendation}`);
  }

  return lines.join('\n');
}

function renderBestPracticesSection(gapCheck) {
  const bestPractices = gapCheck?.bestPractices;
  if (!bestPractices) {
    return '- status: unavailable';
  }

  const suggestions = Array.isArray(bestPractices.suggestions)
    ? bestPractices.suggestions
    : [];

  if (suggestions.length === 0) {
    return '- mode: suggestion-only\n- suggestions: none';
  }

  const lines = [
    '- mode: suggestion-only',
    `- total suggestions: ${suggestions.length}`,
    '- policy: do not apply any suggestion without explicit user approval'
  ];

  for (const item of suggestions) {
    lines.push(`- ${item.title} (${item.id})`);
    lines.push(`  proposal: ${item.proposal}`);
  }

  return lines.join('\n');
}

function renderMappedTasksSection(gapCheck) {
  if (!gapCheck || !Array.isArray(gapCheck.mappedTasks) || gapCheck.mappedTasks.length === 0) {
    return '- not available';
  }

  return gapCheck.mappedTasks.map(task => `- ${task}`).join('\n');
}

function writeWorkItemRecords({ baseDir, changeId, issue, gapCheck }) {
  const recordsBase = path.join(baseDir, '.pdd', 'work-items');
  const changeDir = path.join(recordsBase, 'changes', changeId);
  const planDir = path.join(recordsBase, 'plans', changeId);
  const featureDir = path.join(recordsBase, 'features');

  writeFile(
    path.join(changeDir, 'proposal.md'),
    `# Change Proposal

## Change ID
${changeId}

## Issue
${issue}

## Proposed Solution (concise)

## Why this is the minimal safe option

## Validation with user
- status: pending
- feedback:

## User edits to proposal
`
  );

  writeFile(
    path.join(changeDir, 'decision.md'),
    `# Change Decision

## Change ID
${changeId}

## Decision
- approved: yes | no
- approved_by:
- approved_at:

## Notes
`
  );

  writeFile(
    path.join(planDir, 'plan.md'),
    `# Execution Plan

## Change ID
${changeId}

## Mapped Tasks
${renderMappedTasksSection(gapCheck)}

## Planned Steps (concise)
1.
2.
3.

## Validation and Coverage
- tests:
- coverage target:
`
  );

  writeFile(
    path.join(featureDir, '.gitkeep'),
    ''
  );

  return [
    path.join('.pdd', 'work-items', 'changes', changeId, 'proposal.md'),
    path.join('.pdd', 'work-items', 'changes', changeId, 'decision.md'),
    path.join('.pdd', 'work-items', 'plans', changeId, 'plan.md')
  ];
}

export function generatePatchArtifacts({
  issue,
  baseDir = process.cwd(),
  changeId = null,
  riskAssessment = null,
  gapCheck = null
}) {
  const resolvedChangeId = changeId || `change-${Date.now()}-${slugify(issue || 'update')}`;
  const changeDir = path.join(baseDir, 'changes', resolvedChangeId);

  const files = [
    path.join('changes', resolvedChangeId, 'delta-spec.md'),
    path.join('changes', resolvedChangeId, 'patch-plan.md'),
    path.join('changes', resolvedChangeId, 'verification-report.md'),
    path.join('changes', resolvedChangeId, 'gaps-report.md')
  ];

  writeFile(
    path.join(changeDir, 'delta-spec.md'),
    `# Delta Spec

## Change ID
${resolvedChangeId}

## Issue
${issue}

## Type
bugfix | feature | refactor-safe | hotfix

## Context

## Current Behavior

## Expected Behavior

## Evidence

## Root Cause Hypothesis

## Impacted Areas

## Constraints

## Structural Impact Risks
${renderStructuralRiskSection(riskAssessment)}

## Automatic Gap Check
${renderGapCheckSection(gapCheck)}

## Best-Practices Suggestions (Approval Required)
${renderBestPracticesSection(gapCheck)}

## Minimal Safe Delta

## Alternatives Considered

## Acceptance Criteria

## Verification Strategy
`
  );

  writeFile(
    path.join(changeDir, 'patch-plan.md'),
    `# Patch Plan

## Change ID
${resolvedChangeId}

## Issue
${issue}

## Files to Inspect

## Files to Change

## Task Mapping
${renderMappedTasksSection(gapCheck)}

## Execution Steps
1. Reproduce issue
2. Confirm root cause
3. Apply minimal change
4. Adjust tests
5. Run validations

## Regression Risks

## Structural Impact Risks
${renderStructuralRiskSection(riskAssessment)}

## Automatic Gap Check
${renderGapCheckSection(gapCheck)}

## Best-Practices Suggestions (Approval Required)
${renderBestPracticesSection(gapCheck)}

## Rollback Strategy
`
  );

  writeFile(
    path.join(changeDir, 'verification-report.md'),
    `# Verification Report

## Change ID
${resolvedChangeId}

## Issue
${issue}

## Reproduction

## Changes Made

## Tests Run

## Test Coverage
- minimum threshold:
- measured result:
- status: pass | fail | not-available

## Manual Validation

## Residual Risks

## Final Status
pending
`
  );

  writeFile(
    path.join(changeDir, 'gaps-report.md'),
    `# Gaps Report

## Change ID
${resolvedChangeId}

## Issue
${issue}

## Task Mapping
${renderMappedTasksSection(gapCheck)}

## Automatic Gap Check Summary
${renderGapCheckSection(gapCheck)}

## Best-Practices Suggestions (Approval Required)
${renderBestPracticesSection(gapCheck)}

## Reviewer Decision
- approved: yes | no
- notes:
`
  );

  const workItemFiles = writeWorkItemRecords({
    baseDir,
    changeId: resolvedChangeId,
    issue,
    gapCheck
  });

  files.push(...workItemFiles);

  return {
    changeId: resolvedChangeId,
    changeDir,
    files
  };
}
