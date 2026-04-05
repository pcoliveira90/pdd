export function buildDoctorRemediationPlan({ coreChecks, adapters, installedVersion, currentVersion }) {
  const problems = [];

  const missingCore = Object.entries(coreChecks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  if (missingCore.length > 0) {
    problems.push({
      severity: 'high',
      code: 'missing-core',
      summary: 'Core PDD files are missing',
      details: missingCore,
      action: 'Run `pdd doctor --fix` to restore missing core files.'
    });
  }

  if (!installedVersion) {
    problems.push({
      severity: 'high',
      code: 'missing-version',
      summary: 'Template version metadata is missing',
      details: ['.pdd/version.json'],
      action: 'Run `pdd doctor --fix` or `pdd init --here --force`.'
    });
  } else if (installedVersion !== currentVersion) {
    problems.push({
      severity: 'medium',
      code: 'outdated-templates',
      summary: `Templates are outdated (${installedVersion} → ${currentVersion})`,
      details: [],
      action: 'Run `pdd init --here --upgrade` to update templates safely.'
    });
  }

  const missingAdapters = Object.entries(adapters)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  if (missingAdapters.length === Object.keys(adapters).length) {
    problems.push({
      severity: 'low',
      code: 'no-adapters',
      summary: 'No IDE adapters are installed',
      details: missingAdapters,
      action: 'Run `pdd init --here --ide=claude` (or cursor/copilot).' 
    });
  }

  const ordered = problems.sort((a, b) => rankSeverity(a.severity) - rankSeverity(b.severity));

  return {
    ok: ordered.length === 0,
    problems: ordered,
    nextAction: ordered[0]?.action || null
  };
}

function rankSeverity(severity) {
  switch (severity) {
    case 'high':
      return 0;
    case 'medium':
      return 1;
    default:
      return 2;
  }
}

export function printDoctorRemediationPlan(plan) {
  if (plan.ok) {
    console.log('✅ No guided remediation needed.');
    return;
  }

  console.log('');
  console.log('🧭 Guided remediation');

  plan.problems.forEach((problem, index) => {
    console.log(`${index + 1}. [${problem.severity.toUpperCase()}] ${problem.summary}`);
    if (problem.details.length > 0) {
      console.log(`   Details: ${problem.details.join(', ')}`);
    }
    console.log(`   Action: ${problem.action}`);
  });

  if (plan.nextAction) {
    console.log('');
    console.log(`👉 Recommended next step: ${plan.nextAction}`);
  }
}
