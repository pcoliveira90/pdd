import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';
import { runInit } from './init-command.js';
import { runDoctor } from './doctor-command.js';
import { runStatus } from './status-command.js';
import { setActiveChange, clearActiveChange, markProjectState } from '../core/state-manager.js';

function parseFixArgs(argv) {
  const issue = argv
    .filter(arg => !arg.startsWith('--') && arg !== 'fix')
    .join(' ')
    .trim();

  return {
    issue,
    openPr: argv.includes('--open-pr'),
    dryRun: argv.includes('--dry-run'),
    noValidate: argv.includes('--no-validate')
  };
}

export async function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const cwd = process.cwd();

  if (command === 'init') {
    runInit(argv);
    return;
  }

  if (command === 'doctor') {
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
      console.log('Use: pdd fix "description" [--open-pr] [--dry-run] [--no-validate]');
      process.exit(1);
    }

    console.log('🔧 PDD Fix Workflow');
    console.log(`Issue: ${issue}`);

    if (dryRun) {
      console.log('📝 Dry run only. No files created.');
      return;
    }

    try {
      // set state to in-progress
      const changeId = `change-${Date.now()}`;
      setActiveChange(cwd, changeId, 'in-progress');

      console.log(`Tracking change: ${changeId}`);

      const patch = generatePatchArtifacts({ issue, baseDir: cwd });

      console.log('🧩 Patch artifacts created:');
      patch.files.forEach(file => console.log(`- ${file}`));

      if (!noValidate) {
        runValidation(cwd);
      }

      if (openPr) {
        await openPullRequest({
          issue,
          changeId: patch.changeId,
          changeDir: patch.changeDir,
          baseDir: cwd
        });
      }

      // success
      clearActiveChange(cwd, 'completed');

      console.log('✅ Fix workflow finished.');

    } catch (error) {
      console.error('❌ Fix failed:', error.message);
      markProjectState(cwd, 'failed');
    }

    return;
  }

  if (command === 'help' || !command) {
    console.log('PDD CLI');
    console.log('');
    console.log('Commands:');
    console.log('  pdd init <project-name>');
    console.log('  pdd init --here [--force] [--upgrade] [--ide=claude|cursor|copilot|claude,cursor,copilot]');
    console.log('  pdd doctor [--fix]');
    console.log('  pdd status');
    console.log('  pdd fix "description" [--open-pr] [--dry-run] [--no-validate]');
    console.log('');
    console.log('Examples:');
    console.log('  pdd doctor --fix');
    console.log('  pdd status');
    console.log('  pdd init --here --upgrade');
    console.log('  pdd fix "login not saving incomeStatus" --open-pr');
    console.log('');
    return;
  }

  console.log(`❌ Unknown command: ${command}`);
  console.log('Use: pdd help');
}
