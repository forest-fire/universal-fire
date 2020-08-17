const { join } = require('path');
const { rollup } = require('rollup');
const { builtinModules } = require('module');
const chalk = require('chalk')
let packages = join(__dirname, '..', 'packages');

const sequence = [
  'types', // build:types
  'utility', 'serialized-query', 'serializer-factory', // build:shared
  'firemock', // (abstracted dep)
  'abstracted-database', // build:base
  'real-time-db', 'firestore-db', // build:db
  'real-time-client', 'real-time-admin', 'firestore-client', 'firestore-admin', // build:sdk
  'universal-fire', // build:closure
];
let packagesToBuild = sequence;

const argv = process.argv.slice(2);
if(argv.length > 0) {
  const remove = argv.filter(i => packagesToBuild.includes(`-${i}`)).map(p => p.replace(/^-/,''))
  const add = argv.filter(i => packagesToBuild.includes(i))
  const unknown = argv.filter(i => !remove.includes(i) && !add.includes(i))

  if(remove.length > 0 && add.length > 0) {
    console.log(chalk`- you included parameters to {italic add} packages and {italic remove} them; do one or the other but not both!`);
    process.exit(1)
  }

  if(add.length > 0) {
    packagesToBuild = add;
    console.log(chalk`- doing a partial build of the following packages: {italic ${packagesToBuild.join(', ')}}\n`);
  }
  if(remove.length > 0) {
    packagesToBuild = packagesToBuild.filter(p => !remove.includes(i))
    console.log(chalk`- doing a partial build where the following packages are excluded: {italic ${packagesToBuild.join(', ')}}\n`);
  }
  if(unknown.length > 0) {
    console.log(chalk`{dim - you included unknown parameters to the build command: {italic ${unknown.join(', ')}}}`);
    console.log(chalk`{dim - unknown parameters will be ignored }`);
  }
}


function toPlugins(dir) {
  return [
    require('@rollup/plugin-node-resolve').default(),
    require('rollup-plugin-typescript2')({
      tsconfig: join(dir, 'tsconfig.bundle.json'),
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
    if(packagesToBuild.includes(name)) {
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
    } else {
      console.log(chalk`{dim {italic ~> skipping ${name}}}`);
    }
  }
    
})().catch(err => {
  console.error('Oops~!', err);
  process.exit(1);
});
