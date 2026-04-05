import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generatePatchArtifacts } from '../src/core/patch-generator.js';

test('generatePatchArtifacts keeps provided changeId consistently', () => {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdd-test-'));
  const changeId = `change-${Date.now()}-unit`;

  const result = generatePatchArtifacts({
    issue: 'unit test issue',
    baseDir,
    changeId
  });

  assert.equal(result.changeId, changeId);
  assert.ok(result.files.every(file => file.includes(changeId)));

  const deltaPath = path.join(baseDir, 'changes', changeId, 'delta-spec.md');
  const delta = fs.readFileSync(deltaPath, 'utf-8');
  assert.match(delta, new RegExp(`## Change ID\\n${changeId}`));

  fs.rmSync(baseDir, { recursive: true, force: true });
});
