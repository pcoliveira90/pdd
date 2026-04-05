# PDD + AI Prompts

## Goal
Use AI safely within existing systems.

## Mandatory gate for bugfix and feature

Before editing files, the assistant must first deliver:
- context map
- business rules and constraints
- usability impact
- security impact
- risk map
- structural-impact check (database/schema/migrations/contracts)
- automatic gap check after task mapping
- concise proposal (allow user edits)
- verification strategy

Then it must ask for explicit user approval.
Only after user approval should implementation start.

## Model routing by task type

When possible, select model automatically by phase:
- analysis/recon: more capable model
- implementation/build: balanced model
- tests/coverage loops: faster model
- final review/security: more capable model

If automatic model selection is not available in the current environment,
the assistant must suggest the recommended model profile to the user and ask confirmation.

All plan/change/feature records should be written to `.pdd/work-items/`.

For AI CLI usage, support task-aware routing with `--task` (analysis | build | test | review).
If `--model` is provided explicitly, it overrides automatic routing.

---

## Example: Bugfix Prompt Structure

- Identify root cause
- Map impacted areas
- Propose minimal safe delta
- List regression risks

---

## Example: Feature Prompt Structure

- Understand current behavior
- Define minimal extension
- Ensure compatibility
- Validate change

---

## Key Idea

AI should assist reasoning, not replace system understanding.

PDD provides structure for that.

## CLI usage

Use task mode when invoking `pdd-ai`:

```bash
pdd-ai --provider=openai --task=analysis "login not saving incomeStatus"
```

Task options:
- `analysis`
- `build`
- `test`
- `review`
