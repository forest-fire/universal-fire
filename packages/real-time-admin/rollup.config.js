import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    dir: './dist/es',
    format: 'es',
    sourcemap: 'hidden',
  },
  external: [
    'common-types',
    '@firebase/auth',
    '@firebase/app',
    '@forest-fire/types',
    '@forest-fire/utility',
    'firemock',
    'events',
    'firebase-admin',
  ],
  plugins: [
    typescript({
      rootDir: './',
      tsconfig: 'tsconfig.es.json',
    }),
  ],
};
