# Getting Started with PDD

## Install via npx

```bash
npx @pcoliveira90/pdd init
```

## Worktree-first policy

For mutating workflows, PDD uses linked git worktrees by default.
If you run from the primary worktree, PDD auto-creates one and continues there.

You can still create one manually:

```bash
git worktree add ../pdd-worktrees/my-change -b feature/my-change
```

Use `--allow-main-worktree` only when you intentionally want to stay in the primary worktree.

## What it creates

```
.pdd/
  templates/
  commands/
  memory/
  review/
  work-items/
```

During `pdd init`, PDD also runs an initial project review agent and writes:
- `.pdd/review/project-review.md`
- `.pdd/review/project-review-status.json`

You can approve or request adjustments in the terminal prompt.
Use `--no-project-review` to skip this step.

PDD also provides `.pdd/memory/model-routing.md` with guidance for choosing
the most appropriate model for analysis, build, tests, and review phases.

PDD records plans/changes/features in `.pdd/work-items/`, including editable proposals
that users can adjust before final approval.

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

## Multi-IDE alignment

PDD keeps equivalent workflow intents across tools:
- Cursor: `.cursor/commands/pdd-*.md`
- Claude Code: `.claude/commands/pdd-*.md`
- GitHub Copilot: `.github/prompts/pdd-*.prompt.md`

## Philosophy

PDD is about:
- safe changes
- understanding before coding
- minimizing risk

## Next Steps

- read manifesto
- explore templates
- try fixing a real bug
