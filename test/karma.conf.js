/* Karma configuration */
const BASE = '../build';

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine'], // ['jasmine', 'requirejs'],
    files: [
      `${BASE}/__tests__/*.test.js`,
      { pattern: `${BASE}/randomness.js`, included: false },
    ],
    exclude: [],
    preprocessors: {
      [`${BASE}/randomness.js`]: ['sourcemap'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Firefox'], // ['Firefox', 'Chrome'],
    singleRun: false,
    concurrency: Infinity,
  });
};
