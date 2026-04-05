import { readProjectState } from '../core/state-manager.js';

export function runStatus(baseDir = process.cwd()) {
  const state = readProjectState(baseDir);

  console.log('📊 PDD Status\n');

  console.log(`Status: ${state.status}`);

  if (state.activeChange) {
    console.log(`Active change: ${state.activeChange}`);
  } else {
    console.log('Active change: none');
  }

  if (state.lastChange) {
    console.log(`Last change: ${state.lastChange}`);
  }

  if (state.updatedAt) {
    console.log(`Updated at: ${state.updatedAt}`);
  }

  console.log('');

  if (state.status === 'in-progress') {
    console.log('⚠️ A change is currently in progress');
  } else if (state.status === 'failed') {
    console.log('❌ Last operation failed');
  } else {
    console.log('✅ Project is healthy');
  }
}
