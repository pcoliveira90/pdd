# Installation and Setup

This guide explains how to install and configure PDD.

---

## 1. Install the CLI

Use npx:

```bash
npx @pcoliveira90/pdd init --here
```

Or install globally:

```bash
npm install -g @pcoliveira90/pdd
```

---

## 2. Initialize in a Project

Create PDD files in the current repository:

```bash
pdd init --here
```

Create a new project directory:

```bash
pdd init my-project
```

Force overwrite existing files:

```bash
pdd init --here --force
```

---

## 3. Install IDE Integrations

### Claude Code

```bash
pdd init --here --ide=claude
```

### Cursor

```bash
pdd init --here --ide=cursor
```

### GitHub Copilot

```bash
pdd init --here --ide=copilot
```

### Multiple IDEs

```bash
pdd init --here --ide=claude,cursor,copilot
```

---

## 4. Generated Structure

```txt
.pdd/
  constitution.md
  templates/
  commands/
  memory/
```

Optional adapters may also be created for the selected IDEs.

---

## 5. Core Commands

Initialize:

```bash
pdd init --here
```

Run fix workflow:

```bash
pdd fix "login not saving incomeStatus"
```

Dry run:

```bash
pdd fix "login not saving incomeStatus" --dry-run
```

Skip validation:

```bash
pdd fix "login not saving incomeStatus" --no-validate
```

Prepare PR artifacts:

```bash
pdd fix "login not saving incomeStatus" --open-pr
```

---

## 6. Recommended Workflow

1. Install PDD in the repo
2. Install one or more IDE adapters
3. Run `pdd fix "description"`
4. Review generated artifacts in `changes/<id>/`
5. Let your IDE agent apply and finalize the change
6. Use PR preparation artifacts if needed

---

## 7. Notes

- PDD is the protocol and execution framework
- Claude Code, Cursor, and Copilot act as execution environments
- The workflow is designed to keep the same mental model across IDEs
