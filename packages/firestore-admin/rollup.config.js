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
    'firebase-admin',
    '@firebase/firestore',
    '@firebase/auth',
    '@firebase/app',
    '@forest-fire/firestore-db',
    '@forest-fire/types',
    '@forest-fire/utility',
    'events',
  ],
  plugins: [
    typescript({
      rootDir: './',
      tsconfig: 'tsconfig.es.json',
    }),
  ],
};
