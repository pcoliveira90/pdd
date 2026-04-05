import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runGit(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

function normalizePath(input) {
  return path.resolve(input).replace(/\\/g, '/').toLowerCase();
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'task';
}

function parsePrimaryWorktree(gitWorktreeOutput) {
  const lines = gitWorktreeOutput.split(/\r?\n/);
  const firstWorktreeLine = lines.find(line => line.startsWith('worktree '));
  if (!firstWorktreeLine) return null;
  return firstWorktreeLine.replace(/^worktree\s+/, '').trim();
}

function detectWorktreeContext(cwd) {
  try {
    const inside = runGit(['rev-parse', '--is-inside-work-tree'], cwd);
    if (inside !== 'true') {
      return { inGitRepo: false, shouldRelocate: false };
    }

    const currentTopLevel = runGit(['rev-parse', '--show-toplevel'], cwd);
    const worktreeList = runGit(['worktree', 'list', '--porcelain'], cwd);
    const primaryWorktree = parsePrimaryWorktree(worktreeList);
    if (!primaryWorktree) {
      return { inGitRepo: true, shouldRelocate: false };
    }

    const isPrimary = normalizePath(currentTopLevel) === normalizePath(primaryWorktree);
    return {
      inGitRepo: true,
      shouldRelocate: isPrimary,
      currentTopLevel,
      primaryWorktree
    };
  } catch {
    return { inGitRepo: false, shouldRelocate: false };
  }
}

function createLinkedWorktree({ cwd, commandName }) {
  const repoTopLevel = runGit(['rev-parse', '--show-toplevel'], cwd);
  const repoName = path.basename(repoTopLevel);
  const parentDir = path.dirname(repoTopLevel);
  const poolDir = path.join(parentDir, `${repoName}-worktrees`);
  fs.mkdirSync(poolDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  const shortName = slug(commandName || 'task');
  const branch = `feature/pdd-auto-${shortName}-${stamp}`;
  const worktreeDir = path.join(poolDir, `${shortName}-${stamp}`);

  runGit(['worktree', 'add', worktreeDir, '-b', branch], cwd);

  return { worktreeDir, branch };
}

export function maybeAutoRelocateToWorktree({ cwd, argv, commandName }) {
  const allowMainWorktree = argv.includes('--allow-main-worktree');
  if (allowMainWorktree) return false;

  const context = detectWorktreeContext(cwd);
  if (!context.inGitRepo || !context.shouldRelocate) {
    return false;
  }

  const { worktreeDir, branch } = createLinkedWorktree({ cwd, commandName });

  console.log(`🔀 Main worktree detected. Starting task in linked worktree.`);
  console.log(`- branch: ${branch}`);
  console.log(`- path: ${worktreeDir}`);
  console.log('');

  const forwardArgs = [...argv];
  execFileSync(process.execPath, [process.argv[1], ...forwardArgs], {
    cwd: worktreeDir,
    stdio: 'inherit'
  });

  return true;
}
