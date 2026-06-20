import { defineConfig } from 'vitest/config';
import { loadEnvConfig } from '@next/env';

// Load Next.js environment variables programmatically at startup
loadEnvConfig(process.cwd());

export default defineConfig({
  test: {
    environment: 'node',
  },
});
