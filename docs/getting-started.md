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

## Philosophy

PDD is about:
- safe changes
- understanding before coding
- minimizing risk

## Next Steps

- read manifesto
- explore templates
- try fixing a real bug
