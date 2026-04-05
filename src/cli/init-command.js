import fs from 'fs';
import path from 'path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { CORE_TEMPLATES, IDE_ADAPTERS, PDD_TEMPLATE_VERSION } from '../core/template-registry.js';
import { buildTemplateUpgradePlan, applyTemplateUpgradePlan } from '../core/template-upgrade.js';
import { runInitialProjectReviewAgent } from '../core/project-review-agent.js';
import {
  IDE_ORDER,
  IDE_LABELS,
  detectIdePresence,
  keysWhereDetected
} from '../core/ide-detector.js';

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function normalizeIdeList(argv) {
  const ideArg = argv.find(arg => arg.startsWith('--ide='));
  if (!ideArg) return [];

  return (
    ideArg
      .split('=')[1]
      ?.split(',')
      .map(v => v.trim())
      .filter(Boolean) || []
  );
}

function readInstalledVersion(baseDir) {
  const versionFile = path.join(baseDir, '.pdd/version.json');
  if (!fs.existsSync(versionFile)) return null;

  try {
    return JSON.parse(fs.readFileSync(versionFile, 'utf-8')).templateVersion;
  } catch {
    return null;
  }
}

function installIdeAdapters(baseDir, ideList, force) {
  const results = [];

  for (const ide of ideList) {
    const adapter = IDE_ADAPTERS[ide];
    if (!adapter) {
      results.push({ path: `adapter:${ide}`, status: 'unknown' });
      continue;
    }

    for (const [file, content] of Object.entries(adapter)) {
      const fullPath = path.join(baseDir, file);
      if (!force && fs.existsSync(fullPath)) {
        results.push({ path: file, status: 'skipped' });
        continue;
      }

      writeFile(baseDir, file, content);
      results.push({ path: file, status: 'written' });
    }
  }

  return results;
}

function printUpgradeSummary(summary) {
  console.log('⬆️ PDD upgraded');

  summary.created.forEach(f => console.log(`✔️ created: ${f}`));
  summary.updated.forEach(f => console.log(`🔁 updated: ${f}`));
  summary.conflicts.forEach(f => console.log(`⚠️ conflict: ${f}`));
  summary.skipped.forEach(f => console.log(`⏭️ skipped: ${f}`));

  console.log('');
  console.log(`Summary:`);
  console.log(`- created: ${summary.created.length}`);
  console.log(`- updated: ${summary.updated.length}`);
  console.log(`- conflicts: ${summary.conflicts.length}`);
  console.log(`- skipped: ${summary.skipped.length}`);

  if (summary.conflicts.length > 0) {
    console.log('👉 Run with --force to overwrite conflicts');
  }
}

function ensureConstitution(baseDir, force = false) {
  const constitutionPath = path.join(baseDir, '.pdd/constitution.md');
  if (!force && fs.existsSync(constitutionPath)) {
    return false;
  }

  writeFile(baseDir, '.pdd/constitution.md', CORE_TEMPLATES['.pdd/constitution.md']);
  return true;
}

function resolveIdeSelectionFromInput(raw, presence) {
  const t = raw.trim().toLowerCase();
  if (t === '' || t === 'y' || t === 'yes' || t === 'sim' || t === 's') {
    return keysWhereDetected(presence);
  }
  if (t === 'n' || t === 'no' || t === 'nao') {
    return [];
  }
  if (t === 'a' || t === 'all' || t === 'todos') {
    return [...IDE_ORDER];
  }

  const tokens = t.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  if (tokens.length > 0 && tokens.every(p => /^\d+$/.test(p))) {
    const selected = new Set();
    for (const p of tokens) {
      const n = parseInt(p, 10);
      if (n >= 1 && n <= IDE_ORDER.length) {
        selected.add(IDE_ORDER[n - 1]);
      }
    }
    return IDE_ORDER.filter(k => selected.has(k));
  }

  const names = t.split(',').map(s => s.trim()).filter(Boolean);
  if (names.length > 0) {
    const unknown = names.filter(id => !IDE_ADAPTERS[id]);
    if (unknown.length) {
      console.warn(`⚠️ IDE desconhecido(s): ${unknown.join(', ')} — ignorado(s)`);
    }
    const known = names.filter(id => IDE_ADAPTERS[id]);
    if (known.length === 0) {
      return null;
    }
    return IDE_ORDER.filter(k => known.includes(k));
  }

  return null;
}

async function promptIdeSelection() {
  const presence = detectIdePresence();
  const suggested = keysWhereDetected(presence);

  console.log('');
  console.log('📦 PDD — adaptadores por IDE (prompts / comandos)');
  console.log('');

  IDE_ORDER.forEach((id, i) => {
    const label = IDE_LABELS[id];
    const ok = presence[id] ? 'sim' : 'não';
    console.log(`  [${i + 1}] ${id.padEnd(8)} — ${label}`);
    console.log(`      detetado nesta máquina: ${ok}`);
  });

  console.log('');
  if (suggested.length > 0) {
    console.log(`Sugestão (apenas detetados): ${suggested.join(', ')}`);
  } else {
    console.log('Nenhum IDE foi detetado automaticamente.');
    console.log('Pode ainda instalar adaptadores manualmente (útil para outro ambiente ou CI).');
  }

  console.log('');
  console.log('Opções:');
  console.log('  Enter  → aceitar a sugestão');
  console.log('  a      → instalar todos (cursor, claude, copilot)');
  console.log('  n      → não instalar adaptadores');
  console.log('  1,3    → números separados por vírgula ou espaço');
  console.log('  cursor,copilot → nomes separados por vírgula');
  console.log('');

  const rl = readline.createInterface({ input, output });
  try {
    let answer = (await rl.question('> ')).trim();
    if (answer === '') {
      return suggested;
    }

    let resolved = resolveIdeSelectionFromInput(answer, presence);
    while (resolved === null) {
      console.log('Não percebi. Use Enter, a, n, números (ex.: 1,3) ou nomes (ex.: cursor,claude).');
      answer = (await rl.question('> ')).trim();
      if (answer === '') {
        return suggested;
      }
      resolved = resolveIdeSelectionFromInput(answer, presence);
    }
    return resolved;
  } finally {
    rl.close();
  }
}

async function resolveIdeListInteractive(argv) {
  if (argv.includes('--no-ide-prompt') || process.env.CI === 'true') {
    return [];
  }
  if (argv.includes('-y') || argv.includes('--yes')) {
    const presence = detectIdePresence();
    const detected = keysWhereDetected(presence);
    return detected.length > 0 ? detected : [...IDE_ORDER];
  }
  if (!process.stdin.isTTY) {
    return [];
  }
  return promptIdeSelection();
}

export async function runInit(argv = process.argv.slice(2)) {
  const cwd = process.cwd();
  const here = argv.includes('--here');
  const force = argv.includes('--force');
  const upgrade = argv.includes('--upgrade');
  const noProjectReview = argv.includes('--no-project-review');

  const projectName = !here && argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
  const baseDir = here ? cwd : path.join(cwd, projectName || 'pdd-project');

  if (!here && !fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const installedVersion = readInstalledVersion(baseDir);

  if (upgrade) {
    const plan = buildTemplateUpgradePlan(baseDir, CORE_TEMPLATES);
    const summary = applyTemplateUpgradePlan(baseDir, CORE_TEMPLATES, plan, force);

    writeFile(baseDir, '.pdd/version.json', JSON.stringify({ templateVersion: PDD_TEMPLATE_VERSION }, null, 2));

    printUpgradeSummary(summary);

    if (installedVersion === PDD_TEMPLATE_VERSION) {
      console.log('ℹ️ Templates were already up to date.');
    }
  } else {
    for (const [file, content] of Object.entries(CORE_TEMPLATES)) {
      writeFile(baseDir, file, content);
    }

    console.log('🚀 PDD initialized');
  }

  const constitutionCreated = ensureConstitution(baseDir, force);
  if (constitutionCreated) {
    console.log('📜 Constitution ensured: .pdd/constitution.md');
  }

  let ideList = normalizeIdeList(argv);
  if (ideList.length > 0) {
    const unknown = ideList.filter(id => !IDE_ADAPTERS[id]);
    if (unknown.length) {
      console.warn(`⚠️ Adaptador(es) desconhecido(s): ${unknown.join(', ')} — ignorado(s)`);
    }
    ideList = ideList.filter(id => IDE_ADAPTERS[id]);
  } else {
    ideList = await resolveIdeListInteractive(argv);
  }

  const ideResults = installIdeAdapters(baseDir, ideList, force);
  ideResults.forEach(r => console.log(`- ${r.status}: ${r.path}`));

  if (!noProjectReview) {
    await runInitialProjectReviewAgent(baseDir, argv);
  }
}
