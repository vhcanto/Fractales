import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const hasPixiPackage = existsSync(fileURLToPath(new URL('./node_modules/pixi.js', import.meta.url)));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: hasPixiPackage
      ? {}
      : {
          'pixi.js': fileURLToPath(new URL('./src/lib/fractal/pixi/pixiFallbackStub.ts', import.meta.url)),
        },
  },
});
