'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass')(require('node-sass'));

const concat = require('gulp-concat');

sass.compiler = require('node-sass');

gulp.task('sass', function () {

   return gulp.src('src/sass/**/*.scss')
   .pipe(concat('custom.scss'))
   .pipe(sass().on('error', sass.logError))
   .pipe(gulp.dest('src/css'));
});

// Gulp watcher, automatically runs
gulp.task('sass:watch', function () {

   gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
});