export function getAiProviderConfig(provider = 'openai') {
  const providers = {
    openai: {
      name: 'openai',
      envKey: 'OPENAI_API_KEY',
      baseUrlEnv: 'OPENAI_BASE_URL',
      defaultModel: 'gpt-5'
    },
    claude: {
      name: 'claude',
      envKey: 'ANTHROPIC_API_KEY',
      baseUrlEnv: 'ANTHROPIC_BASE_URL',
      defaultModel: 'claude-sonnet-4-20250514'
    },
    openrouter: {
      name: 'openrouter',
      envKey: 'OPENROUTER_API_KEY',
      baseUrlEnv: 'OPENROUTER_BASE_URL',
      defaultModel: 'openai/gpt-4.1-mini'
    }
  };

  const config = providers[provider];

  if (!config) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  return config;
}

export function listSupportedProviders() {
  return ['openai', 'claude', 'openrouter'];
}
