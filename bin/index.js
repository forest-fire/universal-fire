const { join } = require('path');
const { rollup } = require('rollup');
const { builtinModules } = require('module');

const packages = join(__dirname, '..', 'packages');

// TODO(lukeed): docs
const sequence = [
  'types', 'utility',
  'serialized-query', 'base-serializer',
  'firemock', 'abstracted-database',
  'real-time-db', 'real-time-client', 'real-time-admin',
  'firestore-db', 'firestore-client', 'firestore-admin',
  'db', // "universal-fire"
];

(async function () {
  for (const name of sequence) {
    let dir = join(packages, name);
    let pkg = require(join(dir, 'package.json'));

    if (pkg.private) {
      console.log('~> skipping "%s" package (private)\n', name);
      continue;
    }

    console.log('~> building "%s" package', name);

    let start = Date.now();
    let bundle = await rollup({
      input: join(dir, 'src', 'index.ts'),
      plugins: [
        require('@rollup/plugin-node-resolve').default(),
        require('rollup-plugin-typescript2')({
          tsconfig: join(dir, 'tsconfig.json'),
          useTsconfigDeclarationDir: true, //~> "dist/types"
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
              declarationDir: join(dir, 'dist', 'types')
            }
          }
        }),
      ],
      external: [
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {})
      ]
    });

    await Promise.all([
      bundle.write({
        format: 'esm',
        file: join(dir, 'dist', 'es', 'index.js'),
        sourcemap: false,
      }),
      bundle.write({
        format: 'cjs',
        file: join(dir, 'dist', 'cjs', 'index.js'),
        sourcemap: false,
      })
    ]);

    console.log('~> finished "%s" in %dms\n', name, Date.now() - start);
  }
})().catch(err => {
  console.error('Oops~!', err);
  process.exit(1);
});
