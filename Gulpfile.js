/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
const parsePackageName = require('parse-packagejson-name');
const gulp = require('gulp');
const gulp_clean = require('gulp-clean');
const gulp_concat = require('gulp-concat');
const gulp_sourcemaps = require('gulp-sourcemaps');
const gulp_babel = require('gulp-babel');
const gulp_rename = require('gulp-rename');
const gulp_terser = require('gulp-terser');
const gulp_eslint = require('gulp-eslint');
const karma = require('karma');
const gulp_jsdoc = require('gulp-jsdoc3');
const gulp_jest = require('gulp-jest').default;
const gulp_benchmark = require('gulp-benchmark');
const packageJSON = require('./package.json');

const PACKAGE_NAME = parsePackageName(packageJSON.name).fullName;

const SOURCES = ['__prologue__',
  'Randomness',
  'generators/LinearCongruential',
  'generators/MersenneTwister',
  '__epilogue__',
];

const tasks = {};
exports.tasks = tasks;

tasks.clean = function clean() {
  return gulp.src(['build/*', 'docs/jsdoc/*'], { read: false })
    .pipe(gulp_clean());
};

tasks.concat = function concat() {
  const globs = SOURCES.map((sourceFile) => `src/${sourceFile}.js`);
  return gulp.src(globs)
    .pipe(gulp_sourcemaps.init())
    .pipe(gulp_concat(`${PACKAGE_NAME}.js`));
};

// Linting /////////////////////////////////////////////////////////////////////

tasks.lint = function lint() {
  return gulp.src(['src/**/*.js', 'test/specs/*.test.js'])
    .pipe(gulp_eslint({
      ...packageJSON.eslintConfig,
      globals: [], // ESLint of gulp-eslint fails if `globals` is not an array.
    }))
    .pipe(gulp_eslint.formatEach('compact', process.stderr));
  // FIXME .pipe(gulp_eslint.failAfterError());
};

// Transpilation ///////////////////////////////////////////////////////////////

tasks.es8 = function es8() {
  return tasks.concat()
    .pipe(gulp_babel({
      plugins: [
        '@babel/plugin-proposal-class-properties',
      ],
    }))
    .pipe(gulp_rename(`${PACKAGE_NAME}-es8.js`))
    .pipe(gulp_terser())
    .pipe(gulp_sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
};

tasks.commonjs = function commonjs() {
  return tasks.concat()
    .pipe(gulp_babel({
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-proposal-class-properties',
      ],
    }))
    .pipe(gulp_rename(`${PACKAGE_NAME}-common.js`))
    .pipe(gulp_terser())
    .pipe(gulp_sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
};

tasks.umd = function umd() {
  return tasks.concat()
    .pipe(gulp_babel({
      plugins: [
        '@babel/plugin-transform-modules-umd',
        '@babel/plugin-proposal-class-properties',
      ],
    }))
    .pipe(gulp_terser())
    .pipe(gulp_sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
};

tasks.build = gulp.series(tasks.clean, tasks.lint,
  gulp.parallel(tasks.es8, tasks.commonjs, tasks.umd));

// Testing /////////////////////////////////////////////////////////////////////

tasks.specs = function specs() {
  return gulp.src('test/specs/*.js')
    .pipe(gulp_babel({
      plugins: [
        '@babel/plugin-transform-modules-umd',
        '@babel/plugin-proposal-class-properties',
      ],
    }))
    .pipe(gulp.dest('build/__tests__'));
};

tasks.jest = function jest() {
  return gulp.src('build/__tests__')
    .pipe(gulp_jest({
      ...packageJSON.jest,
    }));
};

tasks.test = gulp.series(tasks.specs, tasks.jest);

const KARMA_CONFIG = {
  basePath: '',
  frameworks: ['jasmine'], // ['jasmine', 'requirejs'],
  files: [
    'test/karma-tester.js',
    { pattern: 'build/__tests__/*.test.js', included: false },
    { pattern: 'build/randomness.js', included: false },
  ],
  exclude: [],
  preprocessors: {
    'build/randomness.js': ['sourcemap'],
  },
  reporters: ['progress'],
  port: 9876,
  colors: true,
  logLevel: 'DEBUG', // 'INFO',
  autoWatch: false,
  singleRun: false,
  concurrency: Infinity,
};

tasks.test_firefox = function test_firefox(done) {
  new karma.Server({
    ...KARMA_CONFIG,
    browsers: ['Firefox'],
  }, done).start();
};

tasks.test_chrome = function test_chrome(done) {
  new karma.Server({
    ...KARMA_CONFIG,
    browsers: ['Chrome'],
  }, done).start();
};

// Benchmarking ////////////////////////////////////////////////////////////////

tasks.benchmark = function benchmark() {
  return gulp.src('build/perf/*.js', { read: false })
    .pipe(gulp_benchmark({
      reporters: benchmark.reporters.etalon('Suite'), // FIXME
    }));
};

// Documentation ///////////////////////////////////////////////////////////////

tasks.jsdoc = function jsdoc() {
  const config = {
    source: {
      exclude: ['src/__prologue__.js', 'src/__epilogue__.js'],
    },
    sourceType: 'script',
    opts: {
      template: 'templates/default',
      encoding: 'utf8',
      recurse: true,
      destination: './docs/jsdoc',
    },
    plugins: [
      'plugins/markdown',
    ],
  };
  return gulp.src(['README.md', 'src/**/*.js'], { read: false })
    .pipe(gulp_jsdoc(config));
};

tasks.default = gulp.series(tasks.build, tasks.test, tasks.jsdoc);

Object.assign(exports, tasks);
