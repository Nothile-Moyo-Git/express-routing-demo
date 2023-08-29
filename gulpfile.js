/**
 * Gulp file
 * This file creates an scss watcher which also minifies the file
 * To do this, once your gulp run is set up properly, run "npm run scss" to create a new css file
 * In order to use "cold-reloading" which creates a new css file after every change, run "npm run watch"
 * You should create a new terminal when you use this, as you'll most likely have a development server running
 * This file also minifies your code and also works with the @use and @forward keyboards
 * 
 * If you want to install the required packages to your current project, add this file where your .src folder is
 * Create a css and scss folder in your "src" folder
 * Run npm init followed by npm install --save-dev gulp gulp-sass sass gulp-csso once you have a package.json file
 * Go to your package.json file and add the 2 new values under your scripts:
 *  "scss": "gulp sass",
 *  "watch": "gulp sass:watch"
 * 
 * Once your css file has been created, that will be the file you should reference statically
 * 
 * Packages required : 
 * gulp (npm install gulp --save-dev)
 * gulp-sass (npm install gulp --save-dev)
 * gulp-csso (npm install gulp-csso --save-dev)
 * sass (npm install sass --save-dev) Note: This is Dart SASS which supports modern functionality
 */

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

   // Parse the file
   return gulp.src('src/scss/**/custom.scss')
   .pipe(
      
      // Convert it to css, if it fails, then display an error. This is done via chaining in JavaScript
      sass().on('error', sass.logError)
   )
   .pipe(
      
      // Minify, compress and optimize the resulting css file
      csso()
   )
   .pipe(

      // Deploy our minified css file to "src/css"
      gulp.dest('src/css')
   );
});

// Gulp watcher, automatically runs
gulp.task('sass:watch', function () {

   // Run the above method continuouly anytime there's a chance to the scss files
   gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
});