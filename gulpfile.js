// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stripDebug= require('gulp-strip-debug')
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('clean', function() {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('images', 'scripts', 'styles');
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('styles', function() {
  return gulp.src('src/styles/style.scss')
    .pipe(sass({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(pixrem())
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.reload({stream:true}));
});


gulp.task('watch', function() {
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/styles/**/*.scss', ['styles']);
});
