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
