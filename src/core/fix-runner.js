import fs from 'fs';
import path from 'path';
import {
  readProjectState,
  setActiveChange,
  clearActiveChange,
  writeProjectState
} from './state-manager.js';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function appendText(filePath, content) {
  ensureDir(filePath);
  fs.appendFileSync(filePath, content, 'utf-8');
}

function writeJson(filePath, value) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}

function nowIso() {
  return new Date().toISOString();
}

function buildFailurePayload({ issue, changeId, phase, error }) {
  return {
    issue,
    changeId,
    phase,
    error: error?.message || String(error),
    failedAt: nowIso()
  };
}

function persistFailureArtifacts(baseDir, payload) {
  const changeDir = path.join(baseDir, 'changes', payload.changeId);
  const failureReportPath = path.join(changeDir, 'failure-report.json');
  const verificationReportPath = path.join(changeDir, 'verification-report.md');

  writeJson(failureReportPath, payload);
  appendText(
    verificationReportPath,
    `\n## Failure\n- phase: ${payload.phase}\n- error: ${payload.error}\n- failedAt: ${payload.failedAt}\n`
  );

  return {
    failureReportPath,
    verificationReportPath
  };
}

export async function runResilientFixWorkflow({
  baseDir = process.cwd(),
  issue,
  dryRun = false,
  noValidate = false,
  openPr = false,
  generatePatchArtifacts,
  runValidation,
  openPullRequest
}) {
  const current = readProjectState(baseDir);
  if (current.status === 'in-progress' && current.activeChange) {
    throw new Error(`Another change is already in progress: ${current.activeChange}`);
  }

  if (dryRun) {
    return {
      status: 'dry-run',
      issue
    };
  }

  const changeId = `change-${Date.now()}`;
  let phase = 'patch-generation';
  setActiveChange(baseDir, changeId, 'in-progress');

  try {
    const patch = generatePatchArtifacts({ issue, baseDir, changeId });

    if (!noValidate) {
      phase = 'validation';
      runValidation(baseDir);
    }

    if (openPr) {
      phase = 'pr-preparation';
      await openPullRequest({
        issue,
        changeId: patch.changeId,
        changeDir: patch.changeDir,
        baseDir
      });
    }

    clearActiveChange(baseDir, 'completed');
    writeProjectState(baseDir, {
      activeChange: null,
      lastChange: patch.changeId,
      status: 'completed',
      lastResult: 'success',
      lastIssue: issue,
      lastPhase: 'completed',
      lastError: null
    });

    return {
      status: 'completed',
      changeId: patch.changeId,
      files: patch.files
    };
  } catch (error) {
    const payload = buildFailurePayload({ issue, changeId, phase, error });
    const artifacts = persistFailureArtifacts(baseDir, payload);

    writeProjectState(baseDir, {
      activeChange: changeId,
      lastChange: changeId,
      status: 'failed',
      lastResult: 'failed',
      lastIssue: issue,
      lastPhase: phase,
      lastError: payload.error,
      lastFailureReport: artifacts.failureReportPath
    });

    const wrapped = new Error(`Fix failed during ${phase}: ${payload.error}`);
    wrapped.cause = error;
    throw wrapped;
  }
}
