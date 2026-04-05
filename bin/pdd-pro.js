#!/usr/bin/env node

import { runCli } from '../src/cli/index.js';

runCli().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
