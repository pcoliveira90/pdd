# AI Providers (PDD CLI)

PDD supports multiple AI providers.

---

## Supported Providers

- openai (default)
- claude (Anthropic)
- openrouter (multi-model gateway)

---

## Usage (future CLI)

```bash
pdd fix --ai "bug description" --provider=openai
pdd fix --ai "bug description" --provider=claude
pdd fix --ai "bug description" --provider=openrouter
```

---

## Environment Variables

### OpenAI

```
OPENAI_API_KEY=...
```

---

### Claude (Anthropic)

```
ANTHROPIC_API_KEY=...
```

---

### OpenRouter

```
OPENROUTER_API_KEY=...
```

---

## Why multiple providers?

- OpenAI → best for structured output
- Claude → best for deep reasoning
- OpenRouter → flexibility across models

---

## Recommendation

Start with OpenAI.
Add Claude for deeper analysis.
Use OpenRouter for experimentation.
