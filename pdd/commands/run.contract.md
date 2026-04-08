# PDD RUN (STRICT CONTRACT)

INPUT:
- type: string
- description: problem or feature description

BEHAVIOR:
- MUST execute full flow:
  RECON → HYPOTHESIS → VERIFY → ACTION → FINAL VERIFY
- MUST NOT return partial results
- If recon.unknowns not empty → ask user and pause
- If recon.risk_level = high → request confirmation before ACTION
- If verify.hypothesis_valid = false → retry HYPOTHESIS (max 2 attempts)

OUTPUT (JSON ONLY):
{
  "recon": {},
  "hypothesis": {},
  "verify": {},
  "action": {},
  "finalVerify": {}
}

STOP CONDITIONS:
- finalVerify.success = true
- verify.regression_risk != "high"

FAIL CONDITIONS:
- Unable to validate hypothesis after 2 attempts
- Missing critical input from user
