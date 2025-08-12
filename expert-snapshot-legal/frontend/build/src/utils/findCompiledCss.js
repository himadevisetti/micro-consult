import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
/**
 * Finds and returns the contents of the compiled CSS file from Vite build.
 */
export function findCompiledCss() {
    // ✅ Reconstruct __dirname in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // ✅ Resolve path to dist/assets from frontend/src/utils
    const assetsDir = path.resolve(__dirname, '../../frontend/assets');
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (!cssFile) {
        throw new Error('Compiled CSS file not found in dist/assets');
    }
    return fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
}
