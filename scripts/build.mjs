import { build } from 'esbuild';

await build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'dist/cli.cjs',
  banner: { js: '#!/usr/bin/env node' },
  minifySyntax: true,
  minifyWhitespace: true,
  sourcemap: false,
  external: [],
});

console.log('Built dist/cli.cjs');
