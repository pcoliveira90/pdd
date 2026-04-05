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
pdd fix "change user table and API contract" --ack-structural-risk
pdd fix "checkout flow regressions" --min-coverage=85 --require-coverage
```

## Worktree behavior

- `pdd fix` auto-creates a linked worktree when executed from the primary worktree.
- Use `--allow-main-worktree` only when you intentionally want to run in the primary worktree.
- `/pdd-fix` in Cursor is a prompt helper; it does not replace CLI execution.

## Principles

- patch first
- validation by default
- test coverage gate with configurable threshold
- structural-impact risk validation (database/contracts/migrations)
- automatic gap check after task mapping
- best-practices check in suggestion-only mode (proposal required, explicit approval required)
- concise proposal + user editable approval step
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

## Documentation

- [Getting Started](./getting-started.md)
- [Installation and Setup](./installation-and-setup.md)
