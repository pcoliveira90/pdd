#!/usr/bin/env node

import { runCli } from '../src/cli/index.js';

runCli(process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
