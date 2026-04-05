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

export function generatePatchArtifacts({ issue, baseDir = process.cwd(), changeId = null }) {
  const resolvedChangeId = changeId || `change-${Date.now()}-${slugify(issue || 'update')}`;
  const changeDir = path.join(baseDir, 'changes', resolvedChangeId);

  const files = [
    path.join('changes', resolvedChangeId, 'delta-spec.md'),
    path.join('changes', resolvedChangeId, 'patch-plan.md'),
    path.join('changes', resolvedChangeId, 'verification-report.md')
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

## Execution Steps
1. Reproduce issue
2. Confirm root cause
3. Apply minimal change
4. Adjust tests
5. Run validations

## Regression Risks

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

## Manual Validation

## Residual Risks

## Final Status
pending
`
  );

  return {
    changeId: resolvedChangeId,
    changeDir,
    files
  };
}
