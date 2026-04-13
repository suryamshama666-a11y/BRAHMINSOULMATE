const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running ESLint with --fix flag to auto-fix issues...\n');

try {
  // Run eslint with --fix flag
  execSync('npm run lint -- --fix', { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  
  console.log('\n✅ Auto-fix completed!');
} catch (error) {
  console.log('\n⚠️  Auto-fix completed with remaining issues');
  console.log('Run "npm run lint" to see remaining problems');
}
