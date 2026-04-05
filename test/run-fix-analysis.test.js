import test from 'node:test';
import assert from 'node:assert/strict';
import { runAiFixAnalysis } from '../src/ai/run-fix-analysis.js';

test('runAiFixAnalysis error example references pdd-ai and supports task arg parsing', async () => {
  await assert.rejects(
    () => runAiFixAnalysis(['--provider=openai', '--task=analysis']),
    error => {
      assert.match(
        String(error.message),
        /pdd-ai --provider=openai --task=analysis/
      );
      return true;
    }
  );
});
