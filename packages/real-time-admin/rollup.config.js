// const typescript = require('@rollup/plugin-typescript');
const typescript = require('rollup-plugin-typescript2');

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
        module: 'es2015',
        declaration: choice === 'es' ? true : false,
      }),
    ],
  };
}

export default [moduleExport('es'), moduleExport('cjs')];
