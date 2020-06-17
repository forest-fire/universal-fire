const typescript = require('@rollup/plugin-typescript');

function moduleExport(choice) {
  return {
    input: './src/RealTimeAdmin.ts',
    output: {
      dir: `./dist/${choice}`,
      format: choice,
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
        tsconfig: `tsconfig.${choice}.json`,
        declaration: choice === 'es' ? true : false,
      }),
    ],
  };
}

export default [moduleExport('es'), moduleExport('cjs')];
