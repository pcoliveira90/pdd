const TASK_ALIASES = {
  analyze: 'analysis',
  analysis: 'analysis',
  recon: 'analysis',
  build: 'build',
  implement: 'build',
  implementation: 'build',
  test: 'test',
  testing: 'test',
  review: 'review',
  security: 'review'
};

const PROVIDER_TASK_MODELS = {
  openai: {
    analysis: 'gpt-5',
    build: 'gpt-5',
    test: 'gpt-5-mini',
    review: 'gpt-5'
  },
  claude: {
    analysis: 'claude-sonnet-4-20250514',
    build: 'claude-sonnet-4-20250514',
    test: 'claude-sonnet-4-20250514',
    review: 'claude-sonnet-4-20250514'
  },
  openrouter: {
    analysis: 'anthropic/claude-3.5-sonnet',
    build: 'openai/gpt-4.1',
    test: 'openai/gpt-4.1-mini',
    review: 'anthropic/claude-3.5-sonnet'
  }
};

function normalizeTask(task) {
  const key = String(task || 'analysis').trim().toLowerCase();
  return TASK_ALIASES[key] || null;
}

export function resolveTaskModel({
  provider,
  task = 'analysis',
  explicitModel = null,
  fallbackModel
}) {
  if (explicitModel) {
    return {
      task: normalizeTask(task) || 'analysis',
      model: explicitModel,
      selectedAutomatically: false,
      note: 'Using model explicitly provided by user.'
    };
  }

  const normalizedTask = normalizeTask(task);
  if (!normalizedTask) {
    return {
      task: 'analysis',
      model: fallbackModel,
      selectedAutomatically: false,
      note: `Unknown task "${task}". Suggested fallback model selected.`
    };
  }

  const providerMap = PROVIDER_TASK_MODELS[provider];
  const model = providerMap?.[normalizedTask];
  if (!model) {
    return {
      task: normalizedTask,
      model: fallbackModel,
      selectedAutomatically: false,
      note: 'Automatic task model mapping unavailable for this provider. Suggested fallback model selected.'
    };
  }

  return {
    task: normalizedTask,
    model,
    selectedAutomatically: true,
    note: 'Model selected automatically by task profile.'
  };
}
