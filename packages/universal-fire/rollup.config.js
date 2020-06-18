const typescript = require('@rollup/plugin-typescript');

function moduleExport(choice) {
  return {
    input: './src/index.ts',
    output: {
      dir: `./dist/${choice}`,
      format: choice,
      sourcemap: 'hidden',
    },
    external: ['firemock', 'firebase-admin'],
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
