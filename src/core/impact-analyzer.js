import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

const DIRECT_IMPACT_RULES = [
  {
    id: 'api-contract',
    label: 'API contract / endpoint behavior',
    patterns: [/\bapi\b/i, /\bendpoint\b/i, /\brequest\b/i, /\bresponse\b/i, /\bpayload\b/i]
  },
  {
    id: 'data-layer',
    label: 'Data layer / persistence behavior',
    patterns: [/\bdatabase\b/i, /\bdb\b/i, /\bschema\b/i, /\bmigration\b/i, /\bquery\b/i]
  },
  {
    id: 'auth-access',
    label: 'Authentication / authorization flow',
    patterns: [/\bauth\b/i, /\blogin\b/i, /\bpermission\b/i, /\brole\b/i, /\bsession\b/i]
  },
  {
    id: 'user-journey',
    label: 'User journey / UI behavior',
    patterns: [/\bui\b/i, /\bux\b/i, /\bfluxo\b/i, /\bjornada\b/i, /\bform\b/i]
  }
];

const INDIRECT_IMPACT_RULES = [
  {
    id: 'integration-ripple',
    label: 'Integration ripple on consumers',
    patterns: [/\bintegration\b/i, /\bconsumer\b/i, /\bwebhook\b/i, /\bevent\b/i, /\bqueue\b/i]
  },
  {
    id: 'operational-impact',
    label: 'Operational/rollout impact',
    patterns: [/\bdeploy\b/i, /\brollout\b/i, /\brollback\b/i, /\bmonitor\b/i, /\bobservability\b/i]
  },
  {
    id: 'security-exposure',
    label: 'Security and data exposure impact',
    patterns: [/\bsecurity\b/i, /\bseguran[cç]a\b/i, /\bprivacidade\b/i, /\bexposi[cç][aã]o\b/i]
  },
  {
    id: 'performance-regression',
    label: 'Performance and scalability side effects',
    patterns: [/\bperformance\b/i, /\blatency\b/i, /\bslow\b/i, /\btimeout\b/i, /\bscal/i]
  }
];

function mapHits(text, rules) {
  return rules
    .filter(rule => hasAny(text, rule.patterns))
    .map(rule => ({ id: rule.id, label: rule.label }));
}

function buildProposal(directImpacts, indirectImpacts) {
  const proposals = [];
  if (directImpacts.length > 0) {
    proposals.push('Confirm direct impact scope (affected modules/contracts) with the user before edits.');
  }
  if (indirectImpacts.length > 0) {
    proposals.push('Confirm indirect impact mitigation (rollback, compatibility, monitoring) with the user.');
  }
  if (proposals.length === 0) {
    proposals.push('No explicit impact signals found; validate assumptions with the user before implementation.');
  }
  return proposals;
}

export function analyzeChangeImpact({ issue = '', riskAssessment = null, gapCheck = null }) {
  const text = String(issue || '').toLowerCase();
  const directImpacts = mapHits(text, DIRECT_IMPACT_RULES);
  const indirectImpacts = mapHits(text, INDIRECT_IMPACT_RULES);

  if (riskAssessment?.hasHighRisk) {
    indirectImpacts.push({
      id: 'structural-risk-ripple',
      label: 'Structural-risk ripple across dependencies'
    });
  }

  if ((gapCheck?.summary?.critical || 0) > 0) {
    indirectImpacts.push({
      id: 'critical-gap-ripple',
      label: 'Critical planning gaps can increase downstream risk'
    });
  }

  const uniqueIndirect = Array.from(
    new Map(indirectImpacts.map(item => [item.id, item])).values()
  );

  return {
    directImpacts,
    indirectImpacts: uniqueIndirect,
    proposal: buildProposal(directImpacts, uniqueIndirect),
    summary: {
      direct: directImpacts.length,
      indirect: uniqueIndirect.length,
      total: directImpacts.length + uniqueIndirect.length,
      needsApproval: directImpacts.length + uniqueIndirect.length > 0
    }
  };
}

export function formatImpactAnalysisSummary(analysis) {
  if (!analysis || analysis.summary.total === 0) {
    return 'Impact analysis (direct/indirect): no explicit impact signals detected.';
  }

  const lines = [
    `Impact analysis (direct/indirect): ${analysis.summary.direct} direct, ${analysis.summary.indirect} indirect.`
  ];

  if (analysis.directImpacts.length > 0) {
    lines.push('- Direct impact:');
    analysis.directImpacts.forEach(item => lines.push(`  - ${item.label}`));
  }

  if (analysis.indirectImpacts.length > 0) {
    lines.push('- Indirect impact:');
    analysis.indirectImpacts.forEach(item => lines.push(`  - ${item.label}`));
  }

  lines.push('- Proposal:');
  analysis.proposal.forEach(item => lines.push(`  - ${item}`));
  lines.push('- Policy: do not proceed with changes before explicit user confirmation.');

  return lines.join('\n');
}

async function askImpactAck() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('');
    console.log('⚠️ Impact analysis gate');
    console.log('Type "IMPACT_OK" to confirm direct/indirect impact review and continue.');
    const answer = await rl.question('> ');
    return answer.trim() === 'IMPACT_OK';
  } finally {
    rl.close();
  }
}

export async function enforceImpactAnalysisAck({
  analysis,
  ackFlag = false,
  dryRun = false,
  isInteractive = process.stdin.isTTY
}) {
  if (!analysis?.summary?.needsApproval || dryRun) {
    return;
  }

  if (ackFlag) {
    return;
  }

  if (isInteractive) {
    const accepted = await askImpactAck();
    if (accepted) return;
  }

  throw new Error(
    'Direct/indirect impact review requires explicit acknowledgment. Re-run with --ack-impact-analysis after review.'
  );
}
