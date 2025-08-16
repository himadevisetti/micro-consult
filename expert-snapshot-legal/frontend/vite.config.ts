import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stringPlugin from 'vite-plugin-string';
import path from 'path'; // ✅ Added for alias resolution

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
        return html; // ✅ ensures Vite processes index.html
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ Enables "@/types/FormType" and similar imports
    },
  },

  build: {
    outDir: 'build/frontend',
    assetsDir: 'assets',
    rollupOptions: {
      input: 'index.html',
    },
    cssCodeSplit: true,
  },

  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
});
