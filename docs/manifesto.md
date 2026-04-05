# PDD Manifesto

PDD exists because most software work happens inside living systems.

We are rarely starting from zero.
We are usually:
- fixing bugs in production
- extending legacy code
- reducing risk while shipping small changes
- preserving trust in systems that already matter

Traditional development guidance often assumes greenfield conditions.
PDD assumes reality.

## What PDD Believes

### 1. Existing systems deserve respect
A working system contains hidden decisions, constraints, trade-offs, and history.
Understanding comes before rewriting.

### 2. Every change is a delta
A bugfix or feature is not an abstract task. It is a change against a current state.
The quality of the delta matters.

### 3. Evidence must come before edits
Logs, failing behavior, contracts, stack traces, and user reports are signals.
A change without evidence is guesswork.

### 4. The safest solution is often the smallest one
Minimal safe delta beats broad rewrites when the goal is reliability.

### 5. Root cause matters more than cosmetic patching
A hidden defect left in place creates future instability.

### 6. Verification is part of the implementation
A change is not done when the code compiles. It is done when the outcome is verified.

### 7. Business rules are non-negotiable
A valid technical patch can still be wrong if it violates business logic.

### 8. Usability is a quality gate
If users cannot complete their task safely and clearly, the change is incomplete.

### 9. Security is always in scope
Every change must evaluate permissions, data exposure, and abuse paths.

### 10. AI should increase confidence, not chaos
PDD is designed for AI-assisted development that is structured, reviewable, and grounded.

## What PDD Is

PDD is:
- a workflow for change in existing systems
- a set of principles and templates
- a practical foundation for AI-assisted bugfix and feature work

## What PDD Is Not

PDD is not:
- a replacement for engineering judgment
- a justification for shallow patching
- a greenfield product design framework

## The Promise

PDD helps teams ship safer changes in real systems.

That is the work.
That is the standard.
