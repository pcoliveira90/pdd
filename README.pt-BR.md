# PDD — Patch-Driven Development

> Entregue mudanças seguras em sistemas vivos.

PDD é um framework open-source focado em **correção de bugs e evolução incremental de sistemas existentes**.

---

## O Problema

A maior parte do desenvolvimento não é greenfield.

É:
- corrigir bugs em produção
- evoluir sistemas legados
- adicionar features sem quebrar nada

---

## A Solução: PDD

PDD foca em:
- entender o sistema atual
- identificar causa raiz
- aplicar o menor delta seguro
- validar com evidência

---

## Fluxo

Issue → Recon → Delta Spec → Patch Plan → Change → Verify

---

## Princípios

- Change-first
- Evidence before edit
- Minimal safe delta
- Root-cause over symptom patch
- Regression-aware
- Reuse existing patterns
- Verifiable outcomes

---

## Estrutura

.pdd/
examples/

---

## Visão

Tornar o desenvolvimento com IA seguro para sistemas reais.
