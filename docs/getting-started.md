# Getting Started with PDD

## Install via npx

```bash
npx @pcoliveira90/pdd init
```

## What it creates

```
.pdd/
  templates/
  commands/
  memory/
  review/
```

During `pdd init`, PDD also runs an initial project review agent and writes:
- `.pdd/review/project-review.md`
- `.pdd/review/project-review-status.json`

You can approve or request adjustments in the terminal prompt.
Use `--no-project-review` to skip this step.

## First workflow

1. Describe the issue
2. Run recon
3. Create delta spec
4. Plan patch
5. Apply change
6. Verify

## Commands quick reference

- `pdd init` — initialize templates and optional IDE adapters
- `pdd doctor` — diagnose setup health (`--fix` to auto-repair)
- `pdd status` — show workflow state
- `pdd fix` — generate artifacts and run validation flow
- `pdd version` — show installed CLI version
- `pdd-ai` — run AI analysis via provider/model selection

## Command scope in Cursor

- `.pdd/commands/` contains concise summaries.
- `.cursor/commands/` is the operational source of truth for Cursor workflows.

## Philosophy

PDD is about:
- safe changes
- understanding before coding
- minimizing risk

## Next Steps

- read manifesto
- explore templates
- try fixing a real bug
