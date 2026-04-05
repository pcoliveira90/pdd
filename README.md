# PDD - Patch-Driven Development

[![npm version](https://img.shields.io/npm/v/@pcoliveira90/pdd)](https://www.npmjs.com/package/@pcoliveira90/pdd)
[![CLI Self Validation](https://github.com/pcoliveira90/pdd/actions/workflows/cli-self-validation.yml/badge.svg)](https://github.com/pcoliveira90/pdd/actions/workflows/cli-self-validation.yml)
[![License: MIT](https://img.shields.io/github/license/pcoliveira90/pdd)](https://github.com/pcoliveira90/pdd/blob/main/LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

> Safe changes in real systems.

PDD is a CLI-first framework for bugfix and feature work in existing codebases.  
It standardizes how teams investigate, plan, validate, and document changes.

Language versions: [English](README.en.md) | [Português (Brasil)](README.pt-BR.md)

## Why PDD

- Worktree-first execution for safer parallel development
- Structured change artifacts (`delta-spec`, `patch-plan`, `verification-report`)
- Consistent workflow for Cursor, Claude Code, and GitHub Copilot
- Built-in quality gates (`doctor`, validation, baseline CI checks)

## Quick Start

```bash
# 1) Initialize PDD in the repository (if running in primary, PDD auto-creates a linked worktree)
pdd init --here

# 2) Run a fix workflow
pdd fix "login not saving incomeStatus"
```

## Core Commands

```bash
pdd init --here
pdd doctor
pdd status
pdd fix "bug description" [--dry-run] [--no-validate] [--open-pr]
pdd version
```

AI analysis command:

```bash
pdd-ai --provider=openai --task=analysis "bug description"
```

## Workflow Summary

1. Understand current behavior and root cause
2. Generate change artifacts under `changes/<change-id>/`
3. Validate tests/lint/build
4. Prepare PR artifacts and review in IDE

## IDE Alignment

PDD keeps equivalent intents across tools:

- Cursor: `.cursor/commands/pdd-*.md`
- Claude Code: `.claude/commands/pdd-*.md`
- GitHub Copilot: `.github/prompts/pdd-*.prompt.md`

## Documentation

- `docs/getting-started.md`
- `docs/installation-and-setup.md`
- `docs/fix-workflow.md`
- `docs/manifesto.md`

## Goal

Reliable execution engine for safe software changes.
