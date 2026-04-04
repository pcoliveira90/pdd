# PDD Fix Workflow

PDD now focuses on execution flow for existing systems:

- generate patch
- validate change
- optionally open PR

## Commands

```bash
pdd fix "login not saving incomeStatus"
pdd fix "login not saving incomeStatus" --open-pr
pdd fix "login not saving incomeStatus" --dry-run
pdd fix "login not saving incomeStatus" --no-validate
```

## Principles

- patch first
- validation by default
- PR is optional and explicit
- keep changes small and reviewable

## Recommended Flow

1. describe the issue
2. generate patch plan
3. apply patch
4. run validation
5. open PR only if `--open-pr` is provided

## Why PR is optional

Some users want:
- local iteration first
- manual review before publishing
- validation without GitHub interaction

PDD keeps PR creation explicit.
