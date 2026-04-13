/**
 * Script to replace console.log/warn calls with logger utility
 * Run with: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const srcDir = path.join(__dirname, '..', 'src');

// Find all TypeScript/TSX files
const files = glob.sync(`${srcDir}/**/*.{ts,tsx}`, {
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/logger.ts', // Don't modify the logger itself
  ]
});

let totalReplacements = 0;
let filesModified = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes("from '@/utils/logger'") || 
                          content.includes('from "@/utils/logger"');
  
  // Check if file has console.log or console.warn
  const hasConsoleCalls = /console\.(log|warn)\(/.test(content);
  
  if (!hasConsoleCalls) {
    return; // Skip files without console calls
  }
  
  // Add logger import if not present
  if (!hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import .+ from .+;$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + 
                "\nimport { logger } from '@/utils/logger';" +
                content.slice(insertPosition);
      modified = true;
    }
  }
  
  // Replace console.log with logger.log
  const logReplacements = (content.match(/console\.log\(/g) || []).length;
  content = content.replace(/console\.log\(/g, 'logger.log(');
  
  // Replace console.warn with logger.warn
  const warnReplacements = (content.match(/console\.warn\(/g) || []).length;
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  
  if (logReplacements > 0 || warnReplacements > 0) {
    modified = true;
    totalReplacements += logReplacements + warnReplacements;
    filesModified++;
    
    console.log(`✓ ${path.relative(srcDir, filePath)}: ${logReplacements + warnReplacements} replacements`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`\n✅ Complete!`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total replacements: ${totalReplacements}`);
