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

tasks.build = gulp.series(tasks.clean,
  gulp.parallel(tasks.es8, tasks.commonjs, tasks.umd));

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

tasks.test_karma = function test_karma(done) {
  new karma.Server({
    configFile: `${__dirname}/test/karma.conf.js`,
    singleRun: true,
  }, done).start();
};

tasks.jest = function jest() {
  gulp.src('build/**/*.js', { read: false })
    .pipe(gulp_jest(packageJSON.jest));
};

tasks.test = gulp.series(tasks.specs, tasks.jest);

// Benchmarking ////////////////////////////////////////////////////////////////

tasks.benchmark = function benchmark() {
  gulp.src('build/perf/*.js', { read: false })
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

tasks.default = gulp.series(tasks.build, tasks.lint, tasks.test, tasks.jsdoc);
exports.default = tasks.default;
