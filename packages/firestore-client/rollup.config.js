const typescript = require('@rollup/plugin-typescript');

function moduleExport(choice) {
  return {
    input: './src/index.ts',
    output: {
      dir: `./dist/${choice}`,
      format: choice,
      sourcemap: true,
    },
    external: [
      'common-types',
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
        tsconfig: `tsconfig.${choice}.json`,
        declaration: choice === 'es' ? true : false,
      }),
    ],
  };
}

export default [moduleExport('es'), moduleExport('cjs')];
