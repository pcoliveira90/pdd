import fs from 'fs';
import path from 'path';

const DEFAULT_STATE = {
  activeChange: null,
  status: 'idle',
  lastChange: null,
  updatedAt: null
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getStatePath(baseDir = process.cwd()) {
  return path.join(baseDir, '.pdd/state.json');
}

export function readProjectState(baseDir = process.cwd()) {
  const statePath = getStatePath(baseDir);
  if (!fs.existsSync(statePath)) {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    return { ...DEFAULT_STATE, ...raw };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function writeProjectState(baseDir = process.cwd(), nextState = {}) {
  const statePath = getStatePath(baseDir);
  ensureDir(statePath);

  const merged = {
    ...DEFAULT_STATE,
    ...nextState,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(statePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  return merged;
}

export function setActiveChange(baseDir = process.cwd(), changeId, status = 'in-progress') {
  return writeProjectState(baseDir, {
    activeChange: changeId,
    lastChange: changeId,
    status
  });
}

export function markProjectState(baseDir = process.cwd(), status = 'idle') {
  const current = readProjectState(baseDir);
  return writeProjectState(baseDir, {
    ...current,
    status,
    activeChange: status === 'in-progress' ? current.activeChange : null
  });
}

export function clearActiveChange(baseDir = process.cwd(), status = 'idle') {
  const current = readProjectState(baseDir);
  return writeProjectState(baseDir, {
    ...current,
    activeChange: null,
    status
  });
}
