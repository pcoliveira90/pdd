import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { runValidation } from '../core/validator.js';
import { openPullRequest } from '../core/pr-manager.js';
import { generatePatchArtifacts } from '../core/patch-generator.js';
import { runInit } from './init-command.js';
import { runDoctor } from './doctor-command.js';
import { runStatus } from './status-command.js';
import { runResilientFixWorkflow } from '../core/fix-runner.js';
import {
  analyzeStructuralImpact,
  formatRiskSummary,
  enforceStructuralRiskAck
} from '../core/structural-risk-guard.js';
import { runAutomaticGapCheck, formatGapCheckSummary } from '../core/gap-checker.js';
import { maybeAutoRelocateToWorktree } from '../core/worktree-guard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCliVersion() {
  const pkgPath = join(__dirname, '../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function parseFixArgs(argv) {
  const minCoverageArg = argv.find(arg => arg.startsWith('--min-coverage='));
  const parsedMinCoverage = minCoverageArg ? Number(minCoverageArg.split('=')[1]) : null;
  const minCoverage = Number.isFinite(parsedMinCoverage)
    ? parsedMinCoverage
    : Number(process.env.PDD_MIN_COVERAGE || 80);

  const issue = argv
    .filter(arg => !arg.startsWith('--') && arg !== 'fix')
    .join(' ')
    .trim();

  return {
    issue,
    openPr: argv.includes('--open-pr'),
    dryRun: argv.includes('--dry-run'),
    noValidate: argv.includes('--no-validate'),
    ackStructuralRisk: argv.includes('--ack-structural-risk'),
    minCoverage,
    requireCoverage: argv.includes('--require-coverage'),
    noCoverageGate: argv.includes('--no-coverage-gate')
  };
}

export async function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  const cwd = process.cwd();

  if (command === '--version' || command === '-v' || command === '-V' || command === 'version') {
    console.log(readCliVersion());
    return;
  }

  if (command === 'init') {
    await runInit(argv);
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
    const relocated = maybeAutoRelocateToWorktree({
      cwd,
      argv,
      commandName: 'fix'
    });
    if (relocated) return;

    const {
      issue,
      openPr,
      dryRun,
      noValidate,
      ackStructuralRisk,
      minCoverage,
      requireCoverage,
      noCoverageGate
    } = parseFixArgs(argv);

    if (!issue) {
      console.error('❌ Missing issue description.');
      console.log('Use: pdd fix "description" [--open-pr] [--dry-run] [--no-validate] [--ack-structural-risk] [--min-coverage=80] [--require-coverage] [--allow-main-worktree]');
      process.exit(1);
    }

    console.log('🔧 PDD Fix Workflow');
    console.log(`Issue: ${issue}`);
    console.log(`Open PR prep: ${openPr ? 'yes' : 'no'}`);
    console.log(`Dry run: ${dryRun ? 'yes' : 'no'}`);
    console.log(`Validation: ${noValidate ? 'skipped' : 'enabled'}`);
    console.log(`Coverage gate: ${noCoverageGate ? 'disabled' : `enabled (min ${minCoverage}%)`}`);

    const riskAssessment = analyzeStructuralImpact(issue);
    console.log(formatRiskSummary(riskAssessment));
    const gapCheck = runAutomaticGapCheck({
      issue,
      riskAssessment,
      minCoverage
    });
    console.log(formatGapCheckSummary(gapCheck));

    try {
      await enforceStructuralRiskAck({
        assessment: riskAssessment,
        ackFlag: ackStructuralRisk,
        dryRun
      });

      const result = await runResilientFixWorkflow({
        baseDir: cwd,
        issue,
        dryRun,
        noValidate,
        openPr,
        generatePatchArtifacts: args =>
          generatePatchArtifacts({
            ...args,
            riskAssessment,
            gapCheck
          }),
        runValidation: targetBaseDir =>
          runValidation(targetBaseDir, {
            coverageGate: !noCoverageGate,
            minCoverage,
            requireCoverage
          }),
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
    console.log('Commands:');
    console.log('  pdd init <project-name>');
    console.log('  pdd init --here [--force] [--upgrade] [-y] [--no-ide-prompt] [--no-project-review] [--ide=claude|cursor|copilot|...]');
    console.log('  pdd doctor [--fix]');
    console.log('  pdd status');
    console.log('  pdd fix "description" [--open-pr] [--dry-run] [--no-validate] [--ack-structural-risk] [--min-coverage=80] [--require-coverage] [--no-coverage-gate] [--allow-main-worktree]');
    console.log('  pdd version   (or: pdd --version, pdd -v)');
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
