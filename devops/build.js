#!/usr/bin/env node --unhandled-rejections=strict

const { join } = require('path');
const { rollup } = require('rollup');
const { builtinModules } = require('module');
const chalk = require('chalk');

let inSubdirectory = false;

/** structured sequence if named params are not passed */
const sequence = [
  { name: 'types', packages: ['types'] },
  {
    name: 'shared libraries',
    packages: [
      'utility',
      'serialized-query',
      'serializer-factory',
      'abstracted-database',
    ],
  },
  { name: 'databases', packages: ['firemock', 'real-time-db', 'firestore-db'] },
  {
    name: 'SDKs',
    packages: [
      'real-time-client',
      'real-time-admin',
      'firestore-client',
      'firestore-admin',
    ],
  },
  { name: 'universal-fire', packages: ['universal-fire'] },
];

function toPlugins(dir) {
  return [
    require('@rollup/plugin-node-resolve').default(),
    require('rollup-plugin-typescript2')({
      include: ['../**/src/**/*.ts'],
      tsconfig: 'tsconfig.bundle.json',
      typescript: require('ttypescript'),
      useTsconfigDeclarationDir: true, //~> "dist/types"
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: join(dir, 'dist', 'types'),
        },
      },
    }),
  ];
}

async function build(name, opts) {
  let cwd = process.cwd();
  let workingDir = !cwd.includes('/packages/')
    ? join(process.cwd(), `./packages/${name}`)
    : process.cwd();

  let pkg = require(join(workingDir, 'package.json'));
  if (pkg.private) {
    return console.log('~> skipping "%s" package (private)\n', name);
  }

  const bundles =
    name === 'universal-fire'
      ? [
          {
            name: 'universal-fire (browser)',
            opts: {
              input: 'index.browser.ts',
              output: 'browser.js',
            },
          },
          {
            name: 'universal-fire (node)',
            opts: {
              input: 'index.node.ts',
              output: 'index.js',
            },
          },
        ]
      : [{ name, opts: defaultOpts }];

  for (const config of bundles) {
    const entryPoint = join(workingDir, 'src', config.opts.input);
    console.log(
      chalk`~> building "%s" package [{grey  %s }]\n`,
      name,
      entryPoint
    );
    let start = Date.now();
    let bundle = await rollup({
      input: entryPoint,
      plugins: toPlugins(process.cwd()),
      external: [
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.optionalDependencies || {}),
      ],
    });
    await Promise.all([
      bundle.write({
        format: 'es',
        file: join(workingDir, 'dist', 'es', config.opts.output),
        sourcemap: false,
      }),
      bundle.write({
        format: 'cjs',
        file: join(workingDir, 'dist', 'cjs', config.opts.output),
        sourcemap: false,
      }),
    ]);
    console.log('~> finished "%s" in %dms\n', name, Date.now() - start);
  }
}

const defaultOpts = {
  input: 'index.ts',
  output: 'index.js',
};

async function fullBuild() {
  for (const tier of sequence) {
    const { name, packages } = tier;
    console.log(chalk`- {yellow Starting build group} {bold "${name}"}}`);
    const promises = [];
    for (const pkg of packages) {
      promises.push(
        build(pkg, defaultOpts).catch((e) => {
          console.log(
            chalk`- {red Failure building package "${pkg}" in the ${name} build group}`
          );
          process.exit(1);
        })
      );
    }
    await Promise.all(promises).catch((e) => {
      console.log(chalk`- {red Failure in build group {bold "${name}"}}\n${e}`);
      process.exit(1);
    });
    console.log(chalk`- {green Completed build group {bold "${name}"}}`);
  }
}

// MAIN EXECUTION
(async function () {
  const pkg = process.cwd().includes('/packages/')
    ? process.cwd().split('/').pop()
    : undefined;

  const argv = process.argv.slice(1);
  if (argv.length === 0 && !pkg) {
    await fullBuild();
  } else {
    if (pkg)
      build(pkg).catch((e) => {
        throw e;
      });
    else {
      for (const namedPkg of argv) {
        await build.pkg(namedPkg).catch((e) => {
          console.log(
            `Build of package {red ${namedPkg}} failed to build!\n${e}\n`
          );
          process.exit(1);
        });
      }
    }
  }
})().catch((err) => {
  console.error('Oops~!', err);
  process.exit(2);
});