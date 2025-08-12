import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../../');
const dryRun = !process.argv.includes('--write');

console.log(dryRun ? '🧪 Dry run mode' : '✍️ Write mode');
console.log(`🔍 Scanning: ${rootDir}`);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) return [];
      return walk(res);
    } else {
      return /\.(ts|tsx|mts|mjs|js)$/.test(entry.name) ? [res] : [];
    }
  }));
  return files.flat();
}

function rewriteImports(content: string, filePath: string): string {
  const isSourceFile =
    /\.(ts|tsx|mts)$/.test(filePath) ||
    filePath.includes('/src/') ||
    filePath.includes('/test/');

  return content.replace(
    /(?<=import\s[^'"]+['"])(\.{1,2}\/[^'"]+?)(?=['"])/g,
    (match) => {
      if (/\.(js|ts|jsx|tsx|mjs|mts)$/.test(match)) return match;
      return isSourceFile ? match : `${match}.js`;
    }
  );
}

async function processFile(file: string) {
  const original = await fs.readFile(file, 'utf8');
  const updated = rewriteImports(original, file);
  if (original === updated) return;

  if (dryRun) {
    console.log(`🧪 Would update: ${file}`);
  } else {
    await fs.writeFile(file, updated);
    console.log(`✅ Updated: ${file}`);
  }
}

(async () => {
  const files = await walk(rootDir);
  console.log(`📁 Found ${files.length} target files`);
  for (const file of files) {
    await processFile(file);
  }
})();

