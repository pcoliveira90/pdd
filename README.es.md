# PDD — Patch-Driven Development

> Entrega cambios seguros en sistemas vivos.

PDD es un framework open-source enfocado en **corrección de bugs y evolución incremental de sistemas existentes**.

---

## El Problema

La mayor parte del desarrollo no es desde cero.

Es:
- corregir bugs en producción
- evolucionar sistemas legacy
- agregar features sin romper nada

---

## La Solución: PDD

PDD se enfoca en:
- entender el sistema actual
- identificar la causa raíz
- aplicar el delta mínimo seguro
- validar con evidencia

---

## Flujo

Issue → Recon → Delta Spec → Patch Plan → Change → Verify

---

## Principios

- Change-first
- Evidence before edit
- Minimal safe delta
- Root-cause over symptom patch
- Regression-aware
- Reuse existing patterns
- Verifiable outcomes

---

## Estructura

.pdd/
examples/

---

## Visión

Hacer que el desarrollo con IA sea seguro para sistemas reales.
