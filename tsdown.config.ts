import { defineConfig } from 'tsdown'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  dts: true,
  onSuccess: !isProd ? 'node dist/index.js' : undefined,
})
