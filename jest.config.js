const { resolve, join, } = require('path');
const {readdirSync, lstatSync} = require('fs');

const basePath = resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(join(basePath, name)).isDirectory();
});

module.exports = {
  testMatch: ['**/test/**/?(*-)+(spec|test).[jt]s?(x)'],
  // testMatch: ['**/test/multi-path-spec.ts'],

  // Maps a regular expression for a "path" and maps it to a transformer
  // https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    // "<rootDir>/node_modules/(?!(universal-fire|@forest-fire)).+\\.js$",
    resolve(process.cwd(), 'node_modules') +
      `/(?!(universal-fire|@forest-fire)).+\\.js$`,
  ],

  moduleNameMapper: {
    ...packages.reduce(
      (acc, name) => ({
        ...acc,
        [`${name}(.*)$`]: `<rootDir>/packages/./${name}/src/$1`,
      }),
      {}
    ),
  },
  // modules which do NOT export CJS must have an entry to
  // https://jestjs.io/docs/en/configuration#modulenamemapper-objectstring-string--arraystring


  // adds more assertions to the default library that Jest provides
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
};
