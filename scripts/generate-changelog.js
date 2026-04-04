import fs from 'fs';
import { execSync } from 'child_process';

const file = 'CHANGELOG.md';

const commits = execSync('git log --pretty=format:"%h %s" -n 20').toString();

let content = '# Changelog\n\n';
content += '## Latest Changes\n\n';

commits.split('\n').forEach(line => {
  if (line.includes('feat')) {
    content += `- ✨ ${line}\n`;
  } else if (line.includes('fix')) {
    content += `- 🐛 ${line}\n`;
  } else {
    content += `- ${line}\n`;
  }
});

fs.writeFileSync(file, content);
console.log('Changelog updated');
