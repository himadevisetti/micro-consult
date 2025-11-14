// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stringPlugin from 'vite-plugin-string';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  plugins: [
    react(),
    stringPlugin({
      include: ['**/*.txt', '**/*.md'],
    }),
    {
      name: 'force-html-emission',
      transformIndexHtml(html) {
        return html; // ensures Vite processes index.html
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: 'build/frontend',
    assetsDir: 'assets',
    rollupOptions: {
      input: 'index.html',
      external: [
        'fsevents', // prevent native module bundling
        'rollup', // exclude Rollup core from frontend bundle
        'rollup/dist/es/shared/parseAst.js', // exclude Rollup internals that import node:path
        'node:path', // prevent Vite from shimming node:path in browser
        'node:fs', // prevent Vite from shimming node:fs
        'node:url', // prevent Vite from shimming node:url
        'vite/dist/node/constants.js', // exclude Vite internals
        path.resolve(__dirname, 'telemetryProxy.ts'), // exclude telemetryProxy from frontend bundle
        path.resolve(__dirname, 'devServer.mts'), // exclude devServer.mts explicitly
      ],
    },
    cssCodeSplit: true,
  },

  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },

  optimizeDeps: {
    exclude: [
      'fsevents', // prevent pre-bundling of native module
      'rollup',   // prevent Rollup from being scanned by Vite
      'vite',     // prevent Vite internals from being scanned
    ],
  },
});
