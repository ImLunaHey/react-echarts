import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  target: 'node20',
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'echarts', 'echarts/core'],
});
