import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react({
      // Enable custom element support
      include: '**/*.tsx',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  optimizeDeps: {
    // Include Nightingale components in optimization
    include: [
      '@nightingale-elements/nightingale-manager',
      '@nightingale-elements/nightingale-navigation',
      '@nightingale-elements/nightingale-sequence'
    ]
  }
});
