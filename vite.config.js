import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import controllersApi from './src/server/controllers-api';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use(express.json());
        server.middlewares.use('/api/controllers', controllersApi);
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
