'use strict';

// Import gulp model
const gulp = require('gulp');

// Import sass model
const sass = require('gulp-sass')(require('sass'));

// Import minification model
const csso = require('gulp-csso');

// Define our compiler model
sass.compiler = require('sass');

// Compile the scss into css
gulp.task('sass', function () {

   // Find the source of the file
   // Concat it by adding the appropriate new lines
   // Compile the scss code into css with compression in order to reduce the size of the css file
   // Output the newly created css file to the directory

   return gulp.src('src/sass/**/custom.scss')
   .pipe(sass().on('error', sass.logError))
   .pipe(gulp.dest('src/css'));
});

// Gulp watcher, automatically runs
gulp.task('sass:watch', function () {

   // Run the above method continuouly anytime there's a chance to the scss files
   gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
});