# PDD - Patch-Driven Development

[![npm version](https://img.shields.io/npm/v/@pcoliveira90/pdd)](https://www.npmjs.com/package/@pcoliveira90/pdd)
[![CLI Self Validation](https://github.com/pcoliveira90/pdd/actions/workflows/cli-self-validation.yml/badge.svg)](https://github.com/pcoliveira90/pdd/actions/workflows/cli-self-validation.yml)
[![License: MIT](https://img.shields.io/github/license/pcoliveira90/pdd)](https://github.com/pcoliveira90/pdd/blob/main/LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

> Entregue mudancas seguras em sistemas reais.

PDD e um framework orientado a CLI para bugfix e evolucao de features em sistemas existentes.  
Ele padroniza como o time investiga, planeja, valida e documenta mudancas.

Versoes por idioma: [README padrao](README.md) | [English](README.en.md)

## Por que usar PDD

- Execucao worktree-first para desenvolvimento paralelo mais seguro
- Artefatos estruturados de mudanca (`delta-spec`, `patch-plan`, `verification-report`)
- Fluxo consistente para Cursor, Claude Code e GitHub Copilot
- Quality gates nativos (`doctor`, validacao e checagens de CI)

## Inicio rapido

```bash
# 1) Inicialize o PDD no repositorio (se estiver na principal, o PDD cria worktree vinculada automaticamente)
pdd init --here

# 2) Rode um fluxo de correcao
pdd fix "login nao salva incomeStatus"
```

## Comandos principais

```bash
pdd init --here
pdd doctor
pdd status
pdd fix "descricao do bug" [--dry-run] [--no-validate] [--open-pr]
pdd version
```

Comando de analise por IA:

```bash
pdd-ai --provider=openai --task=analysis "descricao do bug"
```

## Resumo do fluxo

1. Entender comportamento atual e causa raiz
2. Gerar artefatos em `changes/<change-id>/`
3. Validar testes/lint/build
4. Preparar artefatos de PR e revisar na IDE

## Alinhamento entre IDEs

O PDD mantem intencoes equivalentes entre ferramentas:

- Cursor: `.cursor/commands/pdd-*.md`
- Claude Code: `.claude/commands/pdd-*.md`
- GitHub Copilot: `.github/prompts/pdd-*.prompt.md`

## Documentacao

- `docs/getting-started.md`
- `docs/installation-and-setup.md`
- `docs/fix-workflow.md`
- `docs/manifesto.md`

## Objetivo

Motor de execucao confiavel para mudancas seguras em software real.
