function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function mapTasks(issue, riskAssessment) {
  const tasks = [
    'Map current vs expected behavior',
    'Confirm root cause',
    'Define minimal safe delta',
    'Define validation plan'
  ];

  if (riskAssessment?.hasHighRisk) {
    tasks.push('Design structural mitigation and rollback plan');
  }

  return tasks;
}

function runBestPracticesSuggestions({ normalizedIssue, riskAssessment, minCoverage }) {
  const suggestions = [];

  const hasRollback = hasAny(normalizedIssue, [
    /\brollback\b/i,
    /\broll back\b/i,
    /\bplano de volta\b/i,
    /\bconting[eê]ncia\b/i
  ]);
  if (!hasRollback) {
    suggestions.push({
      id: 'bp-rollback-plan',
      title: 'Define rollback plan before implementation',
      proposal: 'Add a short rollback/contingency plan and get user approval before applying changes.',
      requiresApproval: true
    });
  }

  const hasMonitoring = hasAny(normalizedIssue, [
    /\bmonitor(a[cç][aã]o|ing)\b/i,
    /\bobservability\b/i,
    /\blog(s)?\b/i,
    /\bmetric(s)?\b/i,
    /\btelemetry\b/i
  ]);
  if (!hasMonitoring) {
    suggestions.push({
      id: 'bp-observability',
      title: 'Add observability checks',
      proposal: 'Propose minimal logs/metrics verification for post-change validation and ask user approval.',
      requiresApproval: true
    });
  }

  if (riskAssessment?.hasHighRisk) {
    const hasGradualRollout = hasAny(normalizedIssue, [
      /\bfeature flag\b/i,
      /\bcanary\b/i,
      /\bgradual\b/i,
      /\bstaged\b/i
    ]);
    if (!hasGradualRollout) {
      suggestions.push({
        id: 'bp-gradual-rollout',
        title: 'Consider gradual rollout for structural-risk changes',
        proposal: 'Propose feature-flag/canary rollout strategy and wait for explicit user agreement.',
        requiresApproval: true
      });
    }
  }

  const hasCoverageTarget = hasAny(normalizedIssue, [
    /\bcoverage\b/i,
    /\bcobertura\b/i,
    new RegExp(String(minCoverage))
  ]);
  if (!hasCoverageTarget) {
    suggestions.push({
      id: 'bp-coverage-target',
      title: 'Set explicit coverage target in proposal',
      proposal: `Propose explicit coverage target (minimum ${minCoverage}%) and confirm with user before implementation.`,
      requiresApproval: true
    });
  }

  return suggestions;
}

export function runAutomaticGapCheck({ issue = '', riskAssessment = null, minCoverage = 80 }) {
  const normalized = String(issue || '').toLowerCase();
  const mappedTasks = mapTasks(normalized, riskAssessment);
  const gaps = [];

  const hasBusinessContext = hasAny(normalized, [
    /\bregra\b/i,
    /\bneg[oó]cio\b/i,
    /\bpolicy\b/i,
    /\bcrit[eé]rio\b/i,
    /\baceita[cç][aã]o\b/i
  ]);
  if (!hasBusinessContext) {
    gaps.push({
      id: 'business-rules-context',
      severity: 'high',
      title: 'Business rules context is not explicit',
      recommendation: 'Document business rules and acceptance criteria before implementation.'
    });
  }

  const hasUsabilityContext = hasAny(normalized, [
    /\busu[aá]rio\b/i,
    /\bux\b/i,
    /\busabilidade\b/i,
    /\bfluxo\b/i,
    /\bjornada\b/i,
    /\binterface\b/i
  ]);
  if (!hasUsabilityContext) {
    gaps.push({
      id: 'usability-context',
      severity: 'medium',
      title: 'Usability impact is not explicit',
      recommendation: 'Map affected journey and UI/interaction impact before implementation.'
    });
  }

  const hasSecurityContext = hasAny(normalized, [
    /\bsecurity\b/i,
    /\bseguran[cç]a\b/i,
    /\bauth\b/i,
    /\bpermiss[aã]o\b/i,
    /\bexposi[cç][aã]o\b/i,
    /\bprivacidade\b/i
  ]);
  if (!hasSecurityContext) {
    gaps.push({
      id: 'security-context',
      severity: 'medium',
      title: 'Security impact is not explicit',
      recommendation: 'Review auth, authorization, and data exposure risks for this change.'
    });
  }

  const hasValidationContext = hasAny(normalized, [
    /\btest\b/i,
    /\bteste\b/i,
    /\bvalida[cç][aã]o\b/i,
    /\bqa\b/i
  ]);
  if (!hasValidationContext) {
    gaps.push({
      id: 'validation-plan',
      severity: 'high',
      title: 'Validation strategy is not explicit',
      recommendation: `Define tests and minimum coverage target (currently ${minCoverage}%).`
    });
  }

  if (riskAssessment?.hasHighRisk) {
    const hasMitigationPlan = hasAny(normalized, [
      /\brollback\b/i,
      /\bmigration\b/i,
      /\bcompatibil/i,
      /\bbackward\b/i
    ]);
    if (!hasMitigationPlan) {
      gaps.push({
        id: 'structural-mitigation',
        severity: 'critical',
        title: 'Structural risk detected without mitigation details',
        recommendation: 'Define migration strategy, compatibility approach, and rollback plan.'
      });
    }
  }

  const criticalCount = gaps.filter(gap => gap.severity === 'critical').length;
  const highCount = gaps.filter(gap => gap.severity === 'high').length;
  const bestPracticeSuggestions = runBestPracticesSuggestions({
    normalizedIssue: normalized,
    riskAssessment,
    minCoverage
  });

  return {
    mappedTasks,
    gaps,
    bestPractices: {
      mode: 'suggestion-only',
      requiresApproval: true,
      suggestions: bestPracticeSuggestions,
      summary: {
        total: bestPracticeSuggestions.length
      }
    },
    summary: {
      total: gaps.length,
      critical: criticalCount,
      high: highCount,
      status: gaps.length === 0 ? 'ok' : 'needs-review'
    }
  };
}

export function formatGapCheckSummary(gapCheck) {
  if (!gapCheck || gapCheck.summary.total === 0) {
    return 'Automatic gap check: no critical gaps detected.';
  }

  return `Automatic gap check: ${gapCheck.summary.total} gap(s) detected (${gapCheck.summary.critical} critical, ${gapCheck.summary.high} high).`;
}

export function formatBestPracticesSummary(gapCheck) {
  const bestPractices = gapCheck?.bestPractices;
  if (!bestPractices) {
    return 'Best-practices check: unavailable.';
  }

  const count = bestPractices.summary?.total || 0;
  if (count === 0) {
    return 'Best-practices check (suggestion-only): no additional suggestions.';
  }

  return [
    `Best-practices check (suggestion-only): ${count} suggestion(s).`,
    'No suggestion should be applied automatically without explicit user approval.'
  ].join('\n');
}
