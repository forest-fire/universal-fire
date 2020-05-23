import typescript from '@rollup/plugin-typescript';

export default {
  input: 'dist/es/index.js',
  output: {
    dir: 'dist/esm',
    format: 'es',
  },
  // plugins: [
  //   typescript({
  //     tsconfig: 'tsconfig.es.json',
  //   }),
  // ],
};
