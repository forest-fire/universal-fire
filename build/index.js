const { join } = require('path');
const { rollup } = require('rollup');
const { builtinModules } = require('module');

const packages = join(__dirname, '..', 'packages');

// TODO(lukeed): docs
const sequence = [
  'types', // build:types
  'utility', 'serialized-query', 'serializer-factory', // build:shared
  'firemock', // (abstracted dep)
  'abstracted-database', // build:base
  'real-time-db', 'firestore-db', // build:db
  'real-time-client', 'real-time-admin', 'firestore-client', 'firestore-admin', // build:sdk
  'universal-fire', // build:closure
];

function toPlugins(dir) {
  return [
    require('@rollup/plugin-node-resolve').default(),
    require('rollup-plugin-typescript2')({
      tsconfig: join(dir, 'tsconfig.json'),
      typescript: require('ttypescript'),
      useTsconfigDeclarationDir: true, //~> "dist/types"
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: join(dir, 'dist', 'types')
        }
      }
    })
  ]
}

async function build(name, opts) {
  let dir = join(packages, name);
  let pkg = require(join(dir, 'package.json'));

  if (pkg.private) {
    return console.log('~> skipping "%s" package (private)\n', name);
  }

  console.log('~> building "%s" package', name);

  let start = Date.now();
  let bundle = await rollup({
    input: join(dir, 'src', opts.input),
    plugins: toPlugins(dir),
    external: [
      ...builtinModules,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.optionalDependencies || {})
    ]
  });

  await Promise.all([
    bundle.write({
      format: 'es',
      file: join(dir, 'dist', 'es', opts.output),
      sourcemap: false,
    }),
    bundle.write({
      format: 'cjs',
      file: join(dir, 'dist', 'cjs', opts.output),
      sourcemap: false,
    }),
  ]);

  console.log('~> finished "%s" in %dms\n', name, Date.now() - start);
}

(async function () {
  for (const name of sequence) {
    if (name === 'universal-fire') {
      console.log('universal-fire (browser)');
      await build(name, {
        input: 'index.browser.ts',
        output: 'browser.js',
      });

      console.log('universal-fire (node)');
      await build(name, {
        input: 'index.node.ts',
        output: 'index.js',
      });
    } else {
      await build(name, {
        input: 'index.ts',
        output: 'index.js',
      });
    }
  }
})().catch(err => {
  console.error('Oops~!', err);
  process.exit(1);
});
