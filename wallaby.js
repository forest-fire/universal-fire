const path = require('path');

module.exports = wallaby => {
  process.env.NODE_PATH +=
    path.delimiter + path.join(wallaby.projectCacheDir, 'packages');

  return {
    files: [
      {
        pattern: 'packages/**'
      },
      {
        pattern: '**/node_modules/**',
        ignore: true
      },
      {
        pattern: 'packages/**/*.spec.ts',
        ignore: true
      }
    ],
    tests: [
      {
        pattern: 'packages/**/*.spec.ts'
      },
      {
        pattern: '**/node_modules/**',
        ignore: true
      }
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'mocha',
    debug: true,
    reportConsoleErrorAsError: true
  };
};
