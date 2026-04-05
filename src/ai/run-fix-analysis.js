import { buildBugfixPrompt } from './analyze-change.js';
import { getAiProviderConfig } from './engine.js';

function extractArgValue(args, name, fallback = null) {
  const prefix = `${name}=`;
  const direct = args.find(arg => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);

  const index = args.findIndex(arg => arg === name);
  if (index >= 0 && args[index + 1]) return args[index + 1];

  return fallback;
}

function getIssueFromArgs(args) {
  const filtered = args.filter(
    arg =>
      !arg.startsWith('--provider') &&
      !arg.startsWith('--model') &&
      !arg.startsWith('--task') &&
      arg !== 'fix' &&
      arg !== '--ai'
  );
  return filtered.join(' ').trim();
}

function buildStructuredInstruction() {
  return [
    'Return valid JSON only.',
    'Use exactly these keys:',
    '{',
    '  "root_cause_hypothesis": string,',
    '  "impacted_areas": string[],',
    '  "minimal_safe_delta": string,',
    '  "regression_risks": string[],',
    '  "validation_plan": string[]',
    '}'
  ].join('\n');
}

async function callOpenAI({ prompt, model, apiKey, baseUrl }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: buildStructuredInstruction() },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callClaude({ prompt, model, apiKey, baseUrl }) {
  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0.2,
      system: buildStructuredInstruction(),
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

async function callOpenRouter({ prompt, model, apiKey, baseUrl }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/pcoliveira90/pdd',
      'X-Title': 'PDD CLI'
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: buildStructuredInstruction() },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function resolveBaseUrl(providerConfig) {
  const envValue = process.env[providerConfig.baseUrlEnv];
  if (envValue) return envValue;

  if (providerConfig.name === 'openai') return 'https://api.openai.com/v1';
  if (providerConfig.name === 'claude') return 'https://api.anthropic.com/v1';
  if (providerConfig.name === 'openrouter') return 'https://openrouter.ai/api/v1';

  throw new Error(`Missing base URL for provider: ${providerConfig.name}`);
}

function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      raw_output: text
    };
  }
}

export async function runAiFixAnalysis(argv = process.argv.slice(2)) {
  const provider = extractArgValue(argv, '--provider', 'openai');
  const providerConfig = getAiProviderConfig(provider);
  const model = extractArgValue(argv, '--model', providerConfig.defaultModel);
  const task = extractArgValue(argv, '--task', 'analysis');
  const issue = getIssueFromArgs(argv);

  if (!issue) {
    throw new Error('Missing issue description. Example: pdd-ai --provider=openai --task=analysis "login not saving incomeStatus"');
  }

  const apiKey = process.env[providerConfig.envKey];
  if (!apiKey) {
    throw new Error(`Missing API key. Set ${providerConfig.envKey}.`);
  }

  const baseUrl = resolveBaseUrl(providerConfig);
  const prompt = [
    `Task mode: ${task}`,
    '',
    buildBugfixPrompt({ issue })
  ].join('\n');

  let raw;
  if (provider === 'openai') {
    raw = await callOpenAI({ prompt, model, apiKey, baseUrl });
  } else if (provider === 'claude') {
    raw = await callClaude({ prompt, model, apiKey, baseUrl });
  } else if (provider === 'openrouter') {
    raw = await callOpenRouter({ prompt, model, apiKey, baseUrl });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const parsed = parseJsonSafely(raw);

  return {
    provider,
    task,
    model,
    issue,
    result: parsed
  };
}
