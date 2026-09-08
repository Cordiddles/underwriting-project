import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: 'dist-vercel', emptyOutDir: true },
});
