# PDD in Cursor (Spec Kit–style)

PDD now ships **project rules** and **slash commands** via `pdd init --here --ide=cursor`:

- **`.cursor/rules/pdd.mdc`** — always-on context (like Spec Kit rules)
- **`.cursor/commands/pdd*.md`** — type **`/`** in Chat/Agent to run `/pdd`, `/pdd-recon`, `/pdd-fix`, `/pdd-feature`, `/pdd-verify`

This file is legacy; the CLI installs the folders above. Re-run:

```bash
npx pdd init --here --ide=cursor --force
```
