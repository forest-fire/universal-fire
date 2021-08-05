module.exports = function (wallaby)  {

  return {
    autoDetect: true,
    testFramework: {
      configFile: './jest.config.ts',
    },
    debug: true,
    reportConsoleErrorAsError: true,
  };
};
