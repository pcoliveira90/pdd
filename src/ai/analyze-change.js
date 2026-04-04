import fs from 'fs';
import path from 'path';

function readIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

export function buildAiAnalysisContext(baseDir = process.cwd()) {
  const context = {
    constitution: readIfExists(path.join(baseDir, '.pdd', 'constitution.md')),
    deltaSpec: readIfExists(path.join(baseDir, '.pdd', 'templates', 'delta-spec.md')),
    patchPlan: readIfExists(path.join(baseDir, '.pdd', 'templates', 'patch-plan.md')),
    verification: readIfExists(path.join(baseDir, '.pdd', 'templates', 'verification-report.md'))
  };

  return context;
}

export function buildBugfixPrompt({ issue, baseDir = process.cwd() }) {
  const context = buildAiAnalysisContext(baseDir);

  return [
    'You are a senior engineer working in an existing system.',
    'Follow Patch-Driven Development principles.',
    'Focus on root cause, minimal safe delta, and regression awareness.',
    '',
    'Issue:',
    issue,
    '',
    'Available context:',
    JSON.stringify(context, null, 2),
    '',
    'Return:',
    '- root cause hypothesis',
    '- impacted areas',
    '- minimal safe delta',
    '- regression risks',
    '- validation plan'
  ].join('\n');
}
