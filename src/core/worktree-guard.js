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
  return path.resolve(String(input || '')).replace(/\\/g, '/').toLowerCase();
}

function slug(value, max = 40) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'task';
}

export function detectWorktreeContext(baseDir = process.cwd()) {
  try {
    const topLevel = runGit(['rev-parse', '--show-toplevel'], baseDir);
    const gitDir = runGit(['rev-parse', '--git-dir'], baseDir);
    const commonDir = runGit(['rev-parse', '--git-common-dir'], baseDir);

    return {
      isGitRepo: true,
      topLevel,
      isPrimaryWorktree: normalizePath(gitDir) === normalizePath(commonDir)
    };
  } catch {
    return {
      isGitRepo: false,
      topLevel: null,
      isPrimaryWorktree: false
    };
  }
}

export function createLinkedWorktree({
  baseDir = process.cwd(),
  commandName = 'change'
}) {
  const context = detectWorktreeContext(baseDir);
  if (!context.isGitRepo) {
    throw new Error('Current directory is not a git repository.');
  }

  const topLevel = context.topLevel;
  const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], baseDir);
  const startPoint = currentBranch && currentBranch !== 'HEAD' ? currentBranch : 'HEAD';
  const repoName = slug(path.basename(topLevel), 24);
  const commandSlug = slug(commandName, 24);
  const stamp = Date.now();
  const branchName = `feature/pdd-auto-${commandSlug}-${stamp}`;

  const worktreesRoot = path.join(path.dirname(topLevel), 'pdd-worktrees');
  fs.mkdirSync(worktreesRoot, { recursive: true });
  const worktreePath = path.join(worktreesRoot, `${repoName}-${commandSlug}-${stamp}`);

  execFileSync(
    'git',
    ['worktree', 'add', '-b', branchName, worktreePath, startPoint],
    { cwd: topLevel, stdio: 'pipe' }
  );

  return {
    worktreePath,
    branchName,
    baseBranch: startPoint
  };
}

export function enforceLinkedWorktree({
  baseDir = process.cwd(),
  commandName = 'command',
  allowMainWorktree = false
}) {
  const context = detectWorktreeContext(baseDir);
  if (!context.isGitRepo) {
    return context;
  }

  if (context.isPrimaryWorktree && !allowMainWorktree) {
    throw new Error(
      `PDD requires a linked worktree for "${commandName}". Current directory is the primary worktree.\n` +
      'Create one and run there:\n' +
      '  git worktree add ../pdd-worktrees/<name> -b feature/<name>\n' +
      'Or override intentionally with --allow-main-worktree.'
    );
  }

  return context;
}

export function maybeAutoRelocateToWorktree({ cwd, argv, commandName }) {
  if (argv.includes('--allow-main-worktree')) {
    return false;
  }

  const context = detectWorktreeContext(cwd);
  if (!context.isGitRepo || !context.isPrimaryWorktree) {
    return false;
  }

  const { worktreePath, branchName, baseBranch } = createLinkedWorktree({
    baseDir: cwd,
    commandName
  });

  console.log('🔀 Primary worktree detected. Auto-created linked worktree for task execution.');
  console.log(`- base branch: ${baseBranch}`);
  console.log(`- branch: ${branchName}`);
  console.log(`- path: ${worktreePath}`);
  console.log('');

  execFileSync(process.execPath, [process.argv[1], ...argv], {
    cwd: worktreePath,
    stdio: 'inherit'
  });

  return true;
}
