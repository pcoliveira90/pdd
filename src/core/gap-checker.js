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

  return {
    mappedTasks,
    gaps,
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
