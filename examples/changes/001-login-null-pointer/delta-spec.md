# Delta Spec

## Change ID
001-login-null-pointer

## Type
bugfix

## Context
User edits profile but field is not saved.

## Current Behavior
incomeStatus is not persisted.

## Expected Behavior
Field should be saved and returned.

## Root Cause Hypothesis
Mapping layer missing field.

## Minimal Safe Delta
Add field mapping in DTO -> entity.
