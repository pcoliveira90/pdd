# PDD + AI Prompts

## Goal
Use AI safely within existing systems.

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
