// devServer.mts
import './patch-path-to-regexp.js'; // must be first
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

// ✅ Resolve from project root (micro-consult/)
const root = path.resolve(__dirname, '..', '..', '..');
const frontendBuildPath = path.resolve(root, 'expert-snapshot-legal/frontend/build/frontend');
const indexPath = path.join(frontendBuildPath, 'index.html');

// ✅ Base path for template storage (local dev): expert-snapshot-legal/frontend/storage
const storageBasePath = path.resolve(root, 'expert-snapshot-legal/frontend/storage');

// Allowed template extensions
const allowedExtensions = new Set(['.docx', '.pdf']);

async function startDevServer() {
  const app = express();

  app.use(express.json());

  // Serve styles if needed (dev only)
  app.use('/src/styles', express.static(path.resolve(__dirname, 'src/styles')));

  // PDF export route
  const { exportPdfMiddleware } = await import(
    path.resolve(__dirname, 'src/server/exportPdfMiddleware.js')
  );
  app.post('/api/export-pdf', exportPdfMiddleware);

  // Test route
  app.get('/api/test-proxy', (req, res) => {
    res.send('Proxy working');
  });

  // ✅ Return list of templates for a customer
  app.get('/api/templates/:customerId', (req, res) => {
    const { customerId } = req.params;

    const customerTemplatePath = path.join(storageBasePath, customerId, 'templates');

    fs.readdir(customerTemplatePath, (err, files) => {
      if (err || !files || files.length === 0) {
        return res.json({ templates: [] });
      }

      const templates = files
        .filter((f) => {
          const ext = path.extname(f).toLowerCase();
          return allowedExtensions.has(ext);
        })
        .map((f) => ({
          id: path.parse(f).name, // filename without extension
          name: f,                // display name
        }));

      return res.json({ templates });
    });
  });

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: path.resolve(root, 'expert-snapshot-legal/frontend'),
    });

    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving static from:', frontendBuildPath);
    console.log('📄 Index exists:', fs.existsSync(indexPath));

    // Serve static assets
    app.use(express.static(frontendBuildPath));

    // ✅ SPA fallback for React Router
    app.get('*', (req, res) => {
      console.log('🌐 Frontend route hit:', req.url);
      res.sendFile(indexPath);
    });
  }

  app.listen(3001, '127.0.0.1', () => {
    console.log(`✅ Express server running at http://localhost:3001`);
    console.log(`🌍 Mode: ${isDev ? 'development' : 'production'}`);
  });
}

startDevServer();
