const package = require('./package.json');
const parsePackageName = require('parse-packagejson-name');
const gulp = require('gulp');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const rename = require("gulp-rename");
const terser = require('gulp-terser');
const eslint = require('gulp-eslint');
const karma = require('karma');
const jsdoc = require('gulp-jsdoc3');
const jest = require('gulp-jest').default;

const PACKAGE_NAME = parsePackageName(package.name).fullName;

const SOURCES = ['__prologue__',
  'Randomness',
  'generators/LinearCongruential',
  'generators/MersenneTwister',
  '__epilogue__',
];

function task_clean() {
  return gulp.src(['build/*', 'docs/jsdoc/*'], { read: false })
    .pipe(clean());
}

function task_compile() {
  const globs = SOURCES.map((sourceFile) => `src/${sourceFile}.js`);
  return gulp.src(globs)
    .pipe(sourcemaps.init())
    .pipe(concat(`${PACKAGE_NAME}.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(rename(`${PACKAGE_NAME}-full.js`))
    .pipe(gulp.dest('build/'));
}

// Transpilation ///////////////////////////////////////////////////////////////

function task_es() {
  return gulp.src(`build/${PACKAGE_NAME}-full.js`)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      "plugins": [
        "@babel/plugin-proposal-class-properties",
      ]
    }))
    .pipe(rename(`${PACKAGE_NAME}.js`))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
}

function task_commonjs() {
  return gulp.src(`build/${PACKAGE_NAME}-full.js`)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      "plugins": [
        "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-proposal-class-properties",
      ]
    }))
    .pipe(rename(`${PACKAGE_NAME}-common.js`))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
}

function task_umd() {
  return gulp.src(`build/${PACKAGE_NAME}-full.js`)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel({
      "plugins": [
        "@babel/plugin-transform-modules-umd",
        "@babel/plugin-proposal-class-properties",
      ]
    }))
    .pipe(rename(`${PACKAGE_NAME}-umd.js`))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
}

exports.task_build = gulp.series(task_clean, task_compile,
  gulp.parallel(task_es, task_commonjs, task_umd));

// Linting /////////////////////////////////////////////////////////////////////

function task_lint() {
  return gulp.src([`build/${PACKAGE_NAME}.js`])
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(eslint.failAfterError());
}

// Testing /////////////////////////////////////////////////////////////////////

function task_specs_umd() {
  return gulp.src(`test/specs/*.js`)
    .pipe(babel({
      "plugins": [
        "@babel/plugin-transform-modules-umd",
        "@babel/plugin-proposal-class-properties",
      ]
    }))
    .pipe(gulp.dest('build/__tests__'));
}

function task_karma() {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
}

function task_jest() {
  gulp.src('build/**/*.js', { read: false })
    .pipe(jest(package.jest));
}

exports.task_test = gulp.series(task_specs_umd, task_jest);

// Documentation ///////////////////////////////////////////////////////////////

function task_doc() {
  const config = {
    "source": {
      "exclude": ["src/__prologue__.js", "src/__epilogue__.js"],
    },
    "sourceType": "script",
    "opts": {
      "template": "templates/default",
      "encoding": "utf8",
      "recurse": true,
      "destination": "./docs/jsdoc",
    },
    "plugins": [
      "plugins/markdown",
    ],
  };
  return gulp.src(['README.md', 'src/**/*.js'], { read: false })
    .pipe(jsdoc(config));
}

// TODO karma, mocha, perf

exports.default = gulp.series(exports.task_build, task_lint, task_doc);
