# Contributing to PDD

Thanks for your interest in contributing to PDD.

## Development Flow

### GitFlow (branches)

This repo follows **GitFlow** and compliance is **mandatory**:

| Branch | Purpose |
|--------|---------|
| `main` | Production / tagged releases — stable merges only |
| `develop` | Integration — default base for new work |
| `feature/<name>` | New functionality (branch from `develop`) |
| `release/<version>` | Release preparation |
| `hotfix/<name>` | Urgent production fix (branch from `main`) |

Use **kebab-case** after the prefix. Avoid direct commits to `main`.

Contributions that do not follow GitFlow branch policy should be rejected or asked to rebase into a compliant branch.

### Typical steps

1. Branch from `develop` (e.g. `feature/my-change`) or use the same naming on a fork
2. Small, focused changes
3. Clear commit messages (see below)
4. Pull request with context and validation notes

## Commit Conventions

PDD uses conventional-style commits:

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation
- `chore:` maintenance
- `refactor:` safe internal improvements

## What Good Contributions Look Like

- minimal safe delta
- clear reasoning
- verification notes
- no unrelated changes

## Pull Request Checklist

- explain the change
- describe risk
- describe validation
- keep scope small
- confirm GitFlow compliance (`feature/*`, `release/*`, `hotfix/*`)

## Ideas to Contribute

- new CLI commands
- better templates
- improved examples
- AI integrations
- docs and tutorials
