import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';
import { runInit } from './init-command.js';
import { runDoctor } from './doctor-command.js';
import { runStatus } from './status-command.js';
import { runResilientFixWorkflow } from '../core/fix-runner.js';
import { createLinkedWorktree, detectWorktreeContext } from '../core/worktree-guard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCliVersion() {
  const pkgPath = join(__dirname, '../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function parseFixArgs(argv) {
  const issue = argv
    .filter(arg => !arg.startsWith('--') && arg !== 'fix')
    .join(' ')
    .trim();

  return {
    issue,
    openPr: argv.includes('--open-pr'),
    dryRun: argv.includes('--dry-run'),
    noValidate: argv.includes('--no-validate'),
    allowMainWorktree: argv.includes('--allow-main-worktree')
  };
}

function maybeAutoRelocateToWorktree({
  cwd,
  argv,
  commandName,
  enabled
}) {
  if (!enabled || argv.includes('--allow-main-worktree')) {
    return false;
  }

  const context = detectWorktreeContext(cwd);
  if (!context.isGitRepo || !context.isPrimaryWorktree) {
    return false;
  }

  const { worktreePath, branchName } = createLinkedWorktree({
    baseDir: cwd,
    commandName
  });

  console.log(`🔀 Primary worktree detected. Auto-created linked worktree: ${worktreePath}`);
  console.log(`🪴 Branch: ${branchName}`);
  console.log('▶️ Continuing command in the new worktree...');

  const result = spawnSync(
    process.execPath,
    [process.argv[1], ...argv],
    { cwd: worktreePath, stdio: 'inherit' }
  );

  if (result.error) {
    throw result.error;
  }

  process.exitCode = typeof result.status === 'number' ? result.status : 1;
  return true;
}

export async function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const cwd = process.cwd();

  if (command === '--version' || command === '-v' || command === '-V' || command === 'version') {
    console.log(readCliVersion());
    return;
  }

  if (command === 'init') {
    const mutatesCurrentRepo = argv.includes('--here') || argv.includes('--upgrade');
    if (maybeAutoRelocateToWorktree({
      cwd,
      argv,
      commandName: 'init',
      enabled: mutatesCurrentRepo
    })) {
      return;
    }
    await runInit(argv);
    return;
  }

  if (command === 'doctor') {
    if (maybeAutoRelocateToWorktree({
      cwd,
      argv,
      commandName: 'doctor-fix',
      enabled: argv.includes('--fix')
    })) {
      return;
    }
    runDoctor(cwd, argv);
    return;
  }

  if (command === 'status') {
    runStatus(cwd);
    return;
  }

  if (command === 'fix') {
    const { issue, openPr, dryRun, noValidate } = parseFixArgs(argv);

    if (!issue) {
      console.error('❌ Missing issue description.');
      console.log('Use: pdd fix "description" [--open-pr] [--dry-run] [--no-validate] [--allow-main-worktree]');
      process.exit(1);
    }

    if (maybeAutoRelocateToWorktree({
      cwd,
      argv,
      commandName: 'fix',
      enabled: true
    })) {
      return;
    }

    console.log('🔧 PDD Fix Workflow');
    console.log(`Issue: ${issue}`);
    console.log(`Open PR prep: ${openPr ? 'yes' : 'no'}`);
    console.log(`Dry run: ${dryRun ? 'yes' : 'no'}`);
    console.log(`Validation: ${noValidate ? 'skipped' : 'enabled'}`);

    try {
      const result = await runResilientFixWorkflow({
        baseDir: cwd,
        issue,
        dryRun,
        noValidate,
        openPr,
        generatePatchArtifacts,
        runValidation,
        openPullRequest
      });

      if (result.status === 'dry-run') {
        console.log('📝 Dry run only. No files created.');
        return;
      }

      if (result.changeId) {
        console.log(`Tracking change: ${result.changeId}`);
      }

      if (Array.isArray(result.files) && result.files.length > 0) {
        console.log('🧩 Patch artifacts created:');
        result.files.forEach(file => console.log(`- ${file}`));
      }

      console.log('✅ Fix workflow finished.');
    } catch (error) {
      console.error(`❌ ${error.message}`);
      process.exitCode = 1;
    }

    return;
  }

  if (command === 'help' || !command) {
    console.log(`PDD CLI ${readCliVersion()}`);
    console.log('');
    console.log('Core commands:');
    console.log('  pdd init <project-name>                                          Initialize PDD templates in a new folder');
    console.log('  pdd init --here [--force] [--upgrade] [-y] [--no-ide-prompt]     Initialize or upgrade templates in current project');
    console.log('      [--no-project-review] [--ide=claude|cursor|copilot|...]');
    console.log('  pdd doctor [--fix]                                                Check installation health and optionally auto-repair');
    console.log('  pdd status                                                        Show current change workflow state');
    console.log('  pdd fix "description" [--open-pr] [--dry-run] [--no-validate]    Run fix workflow and generate artifacts');
    console.log('  pdd version   (or: pdd --version, pdd -v)                        Show CLI version');
    console.log('');
    console.log('Worktree policy:');
    console.log('  Mutating commands auto-create and use a linked git worktree when needed.');
    console.log('  Use --allow-main-worktree only if you intentionally want to run in primary.');
    console.log('');
    console.log('AI command (official binary):');
    console.log('  pdd-ai [--provider=openai|claude|openrouter] [--task=analysis|build|test|review] [--model=<id>] "issue"');
    console.log('');
    console.log('Examples:');
    console.log('  pdd doctor --fix');
    console.log('  pdd status');
    console.log('  pdd init --here --upgrade');
    console.log('  pdd fix "login not saving incomeStatus" --open-pr');
    console.log('  pdd-ai --provider=openai --task=analysis "login not saving incomeStatus"');
    console.log('');
    return;
  }

  console.log(`❌ Unknown command: ${command}`);
  console.log('Use: pdd help');
}
