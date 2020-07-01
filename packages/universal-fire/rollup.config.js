import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

function moduleExport(choice) {
  return {
    input: './src/index.ts',
    output: {
      dir: `./dist/${choice}`,
      format: choice,
      sourcemap: true,
    },
    external: ['firemock', 'firebase-admin'],
    plugins: [
      resolve(),
      typescript({
        rootDir: './',
        tsconfig: `tsconfig.bundle.json`,
        declaration: choice === 'es' ? true : false,
      }),
    ],
  };
}

export default [moduleExport('es'), moduleExport('cjs')];
