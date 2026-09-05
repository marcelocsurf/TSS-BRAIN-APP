import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Pruebas de compuertas y de lógica pura. Corren en Node, sin base real:
// el cliente de Supabase se reemplaza por src/test/fake-supabase.ts.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'src/test/empty.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
    clearMocks: true,
  },
});
