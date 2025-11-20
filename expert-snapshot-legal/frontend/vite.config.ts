// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stringPlugin from 'vite-plugin-string';
import path from 'path';

const isTelemetryBuild = process.env.BUILD_TELEMETRY === "true";

export default defineConfig(isTelemetryBuild
  ? {
    // ✅ Telemetry build
    build: {
      lib: {
        entry: path.resolve(__dirname, 'telemetryClient.ts'),
        name: 'TelemetryClient',
        fileName: () => 'telemetryClient.js',
        formats: ['es'],
      },
      outDir: 'build/telemetry',
      rollupOptions: {
        external: [
          'fsevents',
          'rollup',
          'rollup/dist/es/shared/parseAst.js',
          'node:path',
          'node:fs',
          'node:url',
          'vite/dist/node/constants.js',
          path.resolve(__dirname, 'devServer.mts'),
        ],
      },
    },
  }
  : {
    // ✅ Main frontend build
    root: '.',
    publicDir: 'public',
    plugins: [
      react(),
      stringPlugin({ include: ['**/*.txt', '**/*.md'] }),
      {
        name: 'force-html-emission',
        transformIndexHtml(html) {
          return html;
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __DISABLE_TELEMETRY__: JSON.stringify(process.env.DISABLE_TELEMETRY === "true"),
    },
    build: {
      outDir: 'build/frontend',
      assetsDir: 'assets',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        external: [
          'fsevents',
          'rollup',
          'rollup/dist/es/shared/parseAst.js',
          'node:path',
          'node:fs',
          'node:url',
          'vite/dist/node/constants.js',
          path.resolve(__dirname, 'devServer.mts'),
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
      exclude: ['fsevents', 'rollup', 'vite'],
    },
  }
);
