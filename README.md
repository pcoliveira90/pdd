# PDD — Patch-Driven Development

> Safe changes in real systems.

PDD is a framework focused on executing safe changes in existing systems.

## CLI

```bash
pdd init
pdd fix "bug"
pdd fix "bug" --dry-run
pdd fix "bug" --no-validate
pdd fix "bug" --open-pr
pdd-ai --provider=openai --task=analysis "bug"
```

## Flow

1. describe issue
2. generate artifacts
3. validate
4. prepare PR (IDE handles opening)

## Goal

Reliable execution engine for safe software changes.
