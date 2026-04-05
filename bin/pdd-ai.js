#!/usr/bin/env node

import { runAiFixAnalysis } from '../src/ai/run-fix-analysis.js';

async function main() {
  try {
    const result = await runAiFixAnalysis(process.argv.slice(2));

    console.log('\n🤖 PDD AI Analysis');
    console.log('----------------------');
    console.log(`Provider: ${result.provider}`);
    console.log(`Task: ${result.task}`);
    console.log(`Model: ${result.model}`);
    console.log(`Model selection: ${result.model_selection?.selected_automatically ? 'automatic' : 'user/fallback'}`);
    if (result.model_selection?.note) {
      console.log(`Selection note: ${result.model_selection.note}`);
    }
    console.log(`Issue: ${result.issue}`);
    console.log('\nResult:\n');

    console.log(JSON.stringify(result.result, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
