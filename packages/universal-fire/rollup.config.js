import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

function moduleExport(choice, isAdmin) {
  return {
    input: `./src/${isAdmin ? 'admin' : 'client'}.ts`,
    output: {
      dir: `./dist/${choice}`,
      format: choice,
      sourcemap: true,
    },
    external: [
      'firemock',
      'firebase-admin',
      'events',
      '@forest-fire/firestore-admin',
      '@forest-fire/real-time-admin',
    ],
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

export default [
  moduleExport('es', false),
  moduleExport('cjs', false),
  // moduleExport('es', true),
  // moduleExport('cjs', true),
];
