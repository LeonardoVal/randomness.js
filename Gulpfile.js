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

const PACKAGE_NAME = parsePackageName(package.name).fullName;

const SOURCES = ['__prologue__',
  'Randomness',
  'generators/LinearCongruential', 
  'generators/MersenneTwister',
  '__epilogue__',
];

gulp.task('clean', function () {
  return gulp.src(['build/*', 'docs/jsdoc/*'], {read: false})
    .pipe(clean());
});

gulp.task('compile', function() {
  const globs = SOURCES.map((sourceFile) => `src/${sourceFile}.js`);
  return gulp.src(globs)
    .pipe(sourcemaps.init())
    .pipe(concat(`${PACKAGE_NAME}.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/'));
});

gulp.task('commonjs', function() {
  return gulp.src(`build/${PACKAGE_NAME}.js`)
    .pipe(sourcemaps.init())
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
});

gulp.task('umd', function() {
  return gulp.src(`build/${PACKAGE_NAME}.js`)
    .pipe(sourcemaps.init())
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
});

gulp.task('lint', function() {
  return gulp.src([`build/${PACKAGE_NAME}.js`])
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(eslint.failAfterError());
});

// TODO jsdoc, karma, mocha

exports.default = gulp.series('clean', 'compile', 'commonjs', 'umd');
