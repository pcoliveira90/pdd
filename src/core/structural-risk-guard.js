import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const STRUCTURAL_RISK_RULES = [
  {
    id: 'database-schema',
    label: 'Database schema/data model changes',
    patterns: [
      /\bdatabase\b/i,
      /\bdb\b/i,
      /\bschema\b/i,
      /\bmigration\b/i,
      /\balter table\b/i,
      /\bdrop table\b/i,
      /\badd column\b/i,
      /\bforeign key\b/i,
      /\bprimary key\b/i,
      /\bindex\b/i
    ]
  },
  {
    id: 'api-contract',
    label: 'API/consumer contract changes',
    patterns: [
      /\bcontract\b/i,
      /\bbreaking\b/i,
      /\bapi\b/i,
      /\bendpoint\b/i,
      /\brequest\b/i,
      /\bresponse\b/i,
      /\bpayload\b/i,
      /\bgraphql\b/i,
      /\bopenapi\b/i
    ]
  },
  {
    id: 'integration-contract',
    label: 'Event/message integration contract changes',
    patterns: [
      /\bevent\b/i,
      /\bmessage\b/i,
      /\btopic\b/i,
      /\bqueue\b/i,
      /\bkafka\b/i,
      /\brabbitmq\b/i,
      /\bsqs\b/i,
      /\bsns\b/i
    ]
  }
];

export function analyzeStructuralImpact(issue = '') {
  const text = String(issue || '');
  const hits = [];

  for (const rule of STRUCTURAL_RISK_RULES) {
    const matchedPatterns = rule.patterns.filter(pattern => pattern.test(text)).map(pattern => pattern.source);
    if (matchedPatterns.length > 0) {
      hits.push({
        id: rule.id,
        label: rule.label,
        evidence: matchedPatterns
      });
    }
  }

  return {
    hasHighRisk: hits.length > 0,
    hits
  };
}

export function formatRiskSummary(assessment) {
  if (!assessment?.hasHighRisk) {
    return 'No high structural impact signals detected in issue description.';
  }

  const lines = ['High structural impact signals detected:'];
  for (const hit of assessment.hits) {
    lines.push(`- ${hit.label} (${hit.id})`);
  }
  return lines.join('\n');
}

async function askForAck() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('');
    console.log('⚠️ Structural-impact risk guard');
    console.log('Type "STRUCTURAL_OK" to continue this fix workflow.');
    const answer = await rl.question('> ');
    return answer.trim() === 'STRUCTURAL_OK';
  } finally {
    rl.close();
  }
}

export async function enforceStructuralRiskAck({
  assessment,
  ackFlag = false,
  dryRun = false,
  isInteractive = process.stdin.isTTY
}) {
  if (!assessment?.hasHighRisk || dryRun) {
    return;
  }

  if (ackFlag) {
    return;
  }

  if (isInteractive) {
    const accepted = await askForAck();
    if (accepted) return;
  }

  throw new Error(
    'High structural-impact risk detected. Re-run with --ack-structural-risk after reviewing risks.'
  );
}
