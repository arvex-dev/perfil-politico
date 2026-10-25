import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Só o piloto simulado (scripts/piloto.ts): pnpm piloto
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['scripts/piloto.ts'], testTimeout: 120_000 },
});
