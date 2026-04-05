import fs from 'fs';
import { execSync, execFileSync } from 'child_process';
import path from 'path';

function runGit(command, baseDir) {
  return execSync(command, { cwd: baseDir, stdio: 'pipe', encoding: 'utf-8' }).trim();
}

function normalize(p) {
  return path.resolve(String(p || '')).toLowerCase();
}

export function detectWorktreeContext(baseDir = process.cwd()) {
  try {
    const topLevel = runGit('git rev-parse --show-toplevel', baseDir);
    const gitDir = runGit('git rev-parse --git-dir', baseDir);
    const commonDir = runGit('git rev-parse --git-common-dir', baseDir);

    const isPrimaryWorktree = normalize(gitDir) === normalize(commonDir);

    return {
      isGitRepo: true,
      topLevel,
      isPrimaryWorktree
    };
  } catch {
    return {
      isGitRepo: false,
      topLevel: null,
      isPrimaryWorktree: false
    };
  }
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
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
  const repoName = slug(path.basename(topLevel)) || 'repo';
  const commandSlug = slug(commandName) || 'change';
  const stamp = Date.now();
  const branchName = `feature/pdd-auto-${commandSlug}-${stamp}`;

  const worktreesRoot = path.join(path.dirname(topLevel), 'pdd-worktrees');
  fs.mkdirSync(worktreesRoot, { recursive: true });
  const worktreePath = path.join(worktreesRoot, `${repoName}-${commandSlug}-${stamp}`);

  execFileSync(
    'git',
    ['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'],
    { cwd: topLevel, stdio: 'pipe' }
  );

  return {
    worktreePath,
    branchName
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
