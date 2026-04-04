# Core Maturity Upgrade (PDD)

This document contains the exact replacements to make PDD production-ready.

---

## 1. index.js (replace completely)

- restore full TEMPLATE_FILES
- integrate patch-generator
- remove placeholder log

---

## 2. validator.js (replace)

- detect package.json
- check available scripts
- run only existing ones
- fallback safely

---

## 3. pr-manager.js (replace)

- detect git remote
- create branch
- commit
- push
- open PR via GitHub API

---

## 4. README update

Replace AI mention with:

"A framework to safely apply changes in existing systems."

---

## 5. fix workflow

Replace placeholder patch with:

- generate change artifacts
- run validation
- open PR optionally

---

## Result

After applying these changes:

- real patch artifacts
- safe validation
- optional PR
- consistent workflow

Target maturity: ~7/10
