# Operations Hardening Roadmap

This roadmap tracks the next steps to improve PDD operational maturity.

## TODO 1 — `pdd doctor --fix`

Goal:
- detect missing or outdated core files
- repair the installation automatically when safe
- install missing adapters when explicitly requested later

Status:
- in progress

## TODO 2 — intelligent upgrade with local-change awareness

Goal:
- compare installed template version vs CLI template version
- warn when local files differ from framework defaults
- avoid blind overwrite of user-customized files

Status:
- planned

## TODO 3 — project state tracking

Goal:
- track active change id
- track in-progress / failed / completed fix workflows
- enable `pdd status`

Status:
- planned

## TODO 4 — resilient fix workflow

Goal:
- improve failure handling during validation and PR prep
- persist failure state in artifacts
- improve user-facing diagnostics

Status:
- planned

## TODO 5 — CLI self-validation in CI

Goal:
- pack and install the CLI in CI
- run `pdd doctor`
- run `pdd init --here`
- run `pdd fix "test" --dry-run`

Status:
- planned

## TODO 6 — guided remediation UX

Goal:
- make doctor output actionable and prioritized
- suggest exact commands per problem
- prepare for future interactive fixes

Status:
- planned

## TODO 7 — debug and traceability

Goal:
- support `--debug`
- improve logs for fix/init/doctor
- simplify troubleshooting in CI and IDEs

Status:
- planned
