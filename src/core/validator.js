import fs from 'fs';
import { execSync } from 'child_process';

function runCommand(command) {
  console.log(`→ ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function resolveCoverageSummaryPath(baseDir) {
  const candidates = [
    `${baseDir}/coverage/coverage-summary.json`,
    `${baseDir}/coverage/summary.json`
  ];

  return candidates.find(filePath => fs.existsSync(filePath)) || null;
}

function readCoverageMetrics(coverageSummaryPath) {
  const raw = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf-8'));
  const total = raw?.total || {};
  const metrics = {
    lines: Number(total?.lines?.pct),
    statements: Number(total?.statements?.pct),
    functions: Number(total?.functions?.pct),
    branches: Number(total?.branches?.pct)
  };

  return Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => Number.isFinite(value))
  );
}

function validateCoverage({
  baseDir,
  minCoverage = 80,
  requireCoverage = false
}) {
  const summaryPath = resolveCoverageSummaryPath(baseDir);
  if (!summaryPath) {
    if (requireCoverage) {
      throw new Error(
        'Coverage report not found. Generate coverage (for example with npm run test:coverage) or disable this gate.'
      );
    }

    console.log('⚠️ Coverage report not found. Skipping coverage gate.');
    return;
  }

  const metrics = readCoverageMetrics(summaryPath);
  const metricEntries = Object.entries(metrics);
  if (metricEntries.length === 0) {
    if (requireCoverage) {
      throw new Error('Coverage summary is invalid or empty.');
    }
    console.log('⚠️ Coverage summary has no numeric metrics. Skipping coverage gate.');
    return;
  }

  let minMetric = metricEntries[0];
  for (const entry of metricEntries.slice(1)) {
    if (entry[1] < minMetric[1]) {
      minMetric = entry;
    }
  }

  const [metricName, metricValue] = minMetric;
  console.log(`Coverage (worst metric: ${metricName}) = ${metricValue.toFixed(2)}%`);
  if (metricValue < minCoverage) {
    throw new Error(
      `Coverage gate failed: ${metricValue.toFixed(2)}% is below minimum ${minCoverage.toFixed(2)}%.`
    );
  }

  console.log(`✅ Coverage gate passed (minimum ${minCoverage.toFixed(2)}%).`);
}

export function runValidation(baseDir = process.cwd(), options = {}) {
  const {
    coverageGate = true,
    minCoverage = Number(process.env.PDD_MIN_COVERAGE || 80),
    requireCoverage = false
  } = options;

  console.log('Running validation...');

  const packageJsonPath = `${baseDir}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found. Skipping validation.');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const scripts = pkg.scripts || {};
  const commands = [];

  if (scripts['test:coverage']) {
    commands.push('npm run test:coverage');
  } else if (scripts.test) {
    commands.push('npm test');
  }
  if (scripts.lint) commands.push('npm run lint');
  if (scripts.build) commands.push('npm run build');

  if (commands.length === 0) {
    console.log('No validation scripts found. Skipping validation.');
    return;
  }

  try {
    commands.forEach(runCommand);
    if (coverageGate) {
      validateCoverage({
        baseDir,
        minCoverage,
        requireCoverage
      });
    }
  } catch {
    throw new Error('Validation failed');
  }

  console.log('Validation passed');
}
