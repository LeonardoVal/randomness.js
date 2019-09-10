/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
const parsePackageName = require('parse-packagejson-name');
const gulp = require('gulp');
const gulp_clean = require('gulp-clean');
const gulp_babel = require('gulp-babel');
const gulp_terser = require('gulp-terser');
const gulp_eslint = require('gulp-eslint');
const gulp_jsdoc = require('gulp-jsdoc3');
const gulp_jest = require('gulp-jest').default;
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const gulp_sourcemaps = require('gulp-sourcemaps');
const packageJSON = require('./package.json');

const PACKAGE_NAME = parsePackageName(packageJSON.name).fullName;

const tasks = {};
exports.tasks = tasks;

// Linting /////////////////////////////////////////////////////////////////////

tasks.lint = function lint() {
  return gulp.src(['src/**/*.js', 'test/specs/*.test.js'])
    .pipe(gulp_eslint({
      ...packageJSON.eslintConfig,
      globals: [], // ESLint of gulp-eslint fails if `globals` is not an array.
    }))
    .pipe(gulp_eslint.formatEach('compact', process.stderr));
};

// Bundling and transpilation //////////////////////////////////////////////////

tasks.clean = function clean() {
  return gulp.src(['dist/*', 'docs/jsdoc/*'], { read: false })
    .pipe(gulp_clean());
};

tasks.umd = function umd() {
  return gulp.src('src/index.js')
    .pipe(named())
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: `${PACKAGE_NAME}.js`,
        libraryTarget: 'umd',
        // Workaround of a webpack bug: <https://github.com/webpack/webpack/issues/6784>.
        globalObject: 'typeof self !== \'undefined\' ? self : this',
      },
      module: {
        rules: [{
          test: /\.jsx?$/,
          use: ['babel-loader'],
          exclude: /node_modules/,
        }],
      },
      devtool: 'source-map',
    }))
    .pipe(gulp.dest('dist/'));
};

tasks.esm = function esm() {
  return gulp.src('src/**/*.js')
    .pipe(gulp_sourcemaps.init())
    .pipe(gulp_babel(packageJSON.babel))
    .pipe(gulp_terser())
    .pipe(gulp_sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'));
};

tasks.build = gulp.series(tasks.lint, tasks.clean, tasks.umd, tasks.esm);

// Testing /////////////////////////////////////////////////////////////////////

tasks.specs = function specs() {
  return gulp.src('test/specs/*.js')
    .pipe(gulp_babel({
      plugins: [
        '@babel/plugin-transform-modules-umd',
        '@babel/plugin-proposal-class-properties',
      ],
    }))
    .pipe(gulp.dest('dist/__tests__'));
};

tasks.jest = function jest() {
  return gulp.src('dist/__tests__')
    .pipe(gulp_jest({
      ...packageJSON.jest,
    }));
};

tasks.test = gulp.series(tasks.specs, tasks.jest);

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

// Default /////////////////////////////////////////////////////////////////////

tasks.default = gulp.series(tasks.build, tasks.test, tasks.jsdoc);

Object.assign(exports, tasks);
