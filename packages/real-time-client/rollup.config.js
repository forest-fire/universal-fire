import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    dir: './dist/esm',
    format: 'es',
    sourcemap: 'hidden'
  },
  plugins: [
    typescript({
      rootDir: './',
      tsconfig: 'tsconfig.es.json',
    }),
  ],
};
