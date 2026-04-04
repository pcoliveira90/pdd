# AI CLI (PDD)

## Vision

Extend PDD CLI with AI capabilities to assist bugfix and feature work.

---

## Future Command

```bash
pdd fix --ai
```

---

## What it will do

- analyze issue
- read project context (.pdd)
- suggest root cause
- propose minimal safe delta
- highlight risks

---

## How it works (concept)

1. Load PDD context (.pdd)
2. Build structured prompt
3. Send to LLM
4. Return structured response

---

## Current Status

Scaffold implemented:

- src/ai/analyze-change.js

Next steps:

- integrate with CLI
- connect to OpenAI API
- add command `pdd fix --ai`

---

## Example Usage (future)

```bash
pdd fix --ai "login not saving incomeStatus"
```

---

## Output Example

- root cause: missing mapper field
- impacted files: client mapper, API
- minimal fix: add mapping
- risks: response contract
- validation: test save + fetch
