// clean-lockfile-diff.ts
import fs from 'fs';

const noisePatterns = [
  /^@babel\//,
  /^@swc\//,
  /^@next\//,
  /^@types\//,
  /^typescript$/,
  /^tslib$/,
  /^styled-jsx$/,
  /^scheduler$/,
  /^source-map-js$/,
  /^lru-cache$/,
  /^picocolors$/,
  /^js-tokens$/,
  /^@img\//,
  /^@prisma\//,
  /^@standard-schema\/spec$/,
];

const filterDeps = (filePath: string): string[] => {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Object.entries(content.packages || {})
    .filter(([_, val]: any) => !val.dev)
    .map(([key]) => key.replace(/^node_modules\//, ''))
    .filter((dep) => !noisePatterns.some((pattern) => pattern.test(dep)))
    .sort();
};

const rootDeps = filterDeps('./package-lock.json');
const frontendDeps = filterDeps('./expert-snapshot-legal/frontend/package-lock.json');

const added = frontendDeps.filter((dep) => !rootDeps.includes(dep));
const removed = rootDeps.filter((dep) => !frontendDeps.includes(dep));

console.log('\n🔺 Added in frontend:\n', added.join('\n'));
console.log('\n🟦 Missing from frontend:\n', removed.join('\n'));
