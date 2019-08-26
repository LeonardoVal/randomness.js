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

const PACKAGE_NAME = parsePackageName(package.name).fullName;

const SOURCES = ['__prologue__',
  'Randomness',
  'generators/LinearCongruential',
  'generators/MersenneTwister',
  '__epilogue__',
];

gulp.task('clean', function () {
  return gulp.src(['build/*', 'docs/jsdoc/*'], { read: false })
    .pipe(clean());
});

gulp.task('compile', function () {
  const globs = SOURCES.map((sourceFile) => `src/${sourceFile}.js`);
  return gulp.src(globs)
    .pipe(sourcemaps.init())
    .pipe(concat(`${PACKAGE_NAME}.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(rename(`${PACKAGE_NAME}-full.js`))
    .pipe(gulp.dest('build/'));
});

gulp.task('es', function () {
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
});

gulp.task('commonjs', function () {
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
});

gulp.task('umd', function () {
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
});

gulp.task('lint', function () {
  return gulp.src([`build/${PACKAGE_NAME}.js`])
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(eslint.failAfterError());
});

gulp.task('karma', function () {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('doc', function () {
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
});

// TODO karma, mocha, perf

exports.default = gulp.series('clean', 'compile', 
  gulp.parallel('es', 'commonjs', 'umd'), 'lint', 'doc');
