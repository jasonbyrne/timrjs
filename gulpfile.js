'use strict';

const gulp = require('gulp');
const wrap = require('gulp-wrap');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const through2 = require('through2');
const browserify = require('browserify');

const version = require('./package.json').version;

const removeFinalSemi = () => (
  through2.obj((file, e, cb) => {
    file.contents = new Buffer(String(file.contents).trim().replace(/;$/, ''));
    cb(null, file);
  })
);

const prodErrors = `if (!DEBUG) {
  return new Error('Minified exception occured; use non-minified dev enviroment for full message.');
}`

const addProdErrors = () => (
  through2.obj((file, e, cb) => {
    file.contents = new Buffer(
      String(file.contents).replace(
        'return function (error) {',
        (match) => match + prodErrors
      )
    );
    cb(null, file);
  })
)

const minCom = `/* TimrJS v${version} | (c) 2016 Joe Smith | https://github.com/joesmith100/timrjs/blob/master/LICENSE */
;<%= contents %>`

const funcWrapper = `/**
 * TimrJS v${version}
 * https://github.com/joesmith100/timrjs
 * https://www.npmjs.com/package/timrjs
 *
 * Compatible with Browsers and NodeJS (CommonJS) and RequireJS.
 *
 * Copyright (c) 2016 Joe Smith
 * Released under the MIT license
 * https://github.com/joesmith100/timrjs/blob/master/LICENSE
 */

// Based off https://github.com/ForbesLindesay/umd/blob/master/template.js
;(function(Timr) {
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = Timr;

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    // Name consistent with npm module
    define('timrjs', [], function() { return Timr; });

  // <script>
  } else {
    var global;
    if (typeof window !== "undefined") {
      global = window;
    } else if (typeof global !== "undefined") {
      global = global;
    } else if (typeof self !== "undefined") {
      global = self;
    } else {
      global = this;
    }
    global.Timr = Timr;
  }
}(<%= contents %>(3)));`

gulp.task('default', () => (
  browserify('./lib/index.js')
    .transform('babelify', {presets: ['es2015'], plugins: ['transform-object-assign']})
    .bundle()
    .pipe(source('timr.js'))
    .pipe(buffer())
    .pipe(removeFinalSemi())
    .pipe(wrap(funcWrapper))
    .pipe(gulp.dest('./dist/'))
    .pipe(addProdErrors())
    .pipe(uglify({compress: {negate_iife: false, global_defs: {DEBUG: false}}}))
    .on('error', gutil.log)
    .pipe(wrap(minCom))
    .pipe(rename('timr.min.js'))
    .pipe(gulp.dest('./dist/'))
));
