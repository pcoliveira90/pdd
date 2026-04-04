# PDD — Patch-Driven Development

> Ship safe, structured changes in living systems.

PDD is a framework focused on **applying safe changes in existing systems**.

---

## Core Idea

Instead of writing code blindly, PDD enforces:

- understand first
- change minimally
- validate always

---

## CLI

```bash
pdd init
pdd fix "bug description"
pdd fix "bug" --open-pr
```

---

## Workflow

1. describe issue
2. generate patch artifacts
3. validate
4. optionally open PR

---

## Vision

A reliable execution engine for safe software changes.
