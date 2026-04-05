import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';
import { runInit } from './init-command.js';
import { runDoctor } from './doctor-command.js';
import { runStatus } from './status-command.js';
import { runResilientFixWorkflow } from '../core/fix-runner.js';

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
