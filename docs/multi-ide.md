# PDD Multi-IDE Architecture

PDD is designed as:

- one framework
- multiple IDE integrations
- one mental model for the user

## Core

The PDD core is shared across all environments:

- `.pdd/constitution.md`
- `.pdd/templates/*`
- `.pdd/commands/*`
- `.pdd/memory/*`
- `changes/<id>/*`

## IDE Adapters

Each IDE consumes the same protocol in its own way.

### Claude Code
- prefers slash commands
- can use `/pdd`
- reads command files and repository context

### Cursor
- can use prompt files / workspace conventions
- can mirror the same `/pdd` mental model
- consumes generated artifacts and instructions

### GitHub Copilot
- can use prompt templates / chat starters
- follows the same PDD execution model
- uses generated artifacts for validation and PR preparation

## Goal

The user should think the same way everywhere:

- describe issue
- generate change artifacts
- validate
- prepare PR

## Design Principle

PDD should not be locked to one IDE.
It should provide a shared protocol and lightweight adapters.
