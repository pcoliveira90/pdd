import fs from 'fs';
import os from 'os';
import path from 'path';

/** Stable order for prompts and numbered selection */
export const IDE_ORDER = ['cursor', 'claude', 'copilot'];

export const IDE_LABELS = {
  cursor: 'Cursor',
  claude: 'Claude (desktop / Claude Code)',
  copilot: 'GitHub Copilot (VS Code)'
};

function exists(p) {
  return Boolean(p && fs.existsSync(p));
}

function vscodeDetected() {
  const platform = process.platform;
  const home = os.homedir();

  if (platform === 'win32') {
    const local = process.env.LOCALAPPDATA;
    const pf = process.env.PROGRAMFILES;
    const pf86 = process.env['PROGRAMFILES(X86)'];
    return (
      exists(local && path.join(local, 'Programs', 'Microsoft VS Code', 'Code.exe')) ||
      exists(pf && path.join(pf, 'Microsoft VS Code', 'Code.exe')) ||
      exists(pf86 && path.join(pf86, 'Microsoft VS Code', 'Code.exe')) ||
      exists(path.join(home, '.vscode'))
    );
  }

  if (platform === 'darwin') {
    return (
      exists('/Applications/Visual Studio Code.app') ||
      exists(path.join(home, '.vscode'))
    );
  }

  return (
    exists('/usr/share/code/code') ||
    exists('/usr/bin/code') ||
    exists('/snap/bin/code') ||
    exists(path.join(home, '.vscode'))
  );
}

/**
 * Heuristic detection of IDE-related tooling (best-effort, no guarantees).
 * @returns {{ cursor: boolean, claude: boolean, copilot: boolean }}
 */
export function detectIdePresence() {
  const platform = process.platform;
  const home = os.homedir();
  const local = process.env.LOCALAPPDATA;

  const presence = {
    cursor: false,
    claude: false,
    copilot: false
  };

  if (platform === 'win32') {
    presence.cursor =
      exists(local && path.join(local, 'Programs', 'cursor', 'Cursor.exe')) ||
      exists(path.join(home, '.cursor'));

    presence.claude =
      exists(local && path.join(local, 'Programs', 'Claude', 'Claude.exe')) ||
      exists(path.join(home, '.claude'));
  } else if (platform === 'darwin') {
    presence.cursor =
      exists('/Applications/Cursor.app') || exists(path.join(home, '.cursor'));

    presence.claude =
      exists('/Applications/Claude.app') || exists(path.join(home, '.claude'));
  } else {
    presence.cursor =
      exists(path.join(home, '.cursor')) ||
      exists('/opt/Cursor') ||
      exists('/usr/share/cursor');

    presence.claude = exists(path.join(home, '.claude'));
  }

  presence.copilot = vscodeDetected();

  return presence;
}

export function keysWhereDetected(presence) {
  return IDE_ORDER.filter(k => presence[k]);
}
