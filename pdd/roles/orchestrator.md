# PDD ORCHESTRATOR ROLE

State model:
{
  "current_step": "recon|hypothesis|verify|action|finalVerify",
  "attempts": { "hypothesis": 0, "verify": 0 }
}

Responsibilities:
- Control flow: RECON → HYPOTHESIS → VERIFY → ACTION → FINAL VERIFY
- Validate each step output against contracts
- Ask user when unknowns exist or input is incomplete
- Loop: if verify.hypothesis_valid = false → back to HYPOTHESIS (max 2 attempts)
- Stop criteria:
  - finalVerify.success = true
  - verify.regression_risk != "high"

Output (final):
{
  "recon": {},
  "hypothesis": {},
  "verify": {},
  "action": {},
  "finalVerify": {}
}
