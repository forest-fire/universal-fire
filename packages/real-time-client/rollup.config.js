import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

function moduleExport(choice) {
  return {
    input: './src/RealTimeClient.ts',
    output: {
      dir: `./dist/${choice}`,
      format: choice,
      sourcemap: 'hidden',
    },
    external: ['@firebase/firestore', 'events', 'firebase-admin'],
    plugins: [
      commonjs(),
      resolve(),
      typescript({
        rootDir: './',
        tsconfig: `tsconfig.${choice}.json`,
        declaration: choice === 'es' ? true : false,
      }),
    ],
  };
}

export default [moduleExport('es'), moduleExport('cjs')];
