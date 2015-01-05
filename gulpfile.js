'use strict';
// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    pixrem = require('gulp-pixrem'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stripDebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync'),
	karma = require('gulp-karma'),
	browserify = require('browserify'),
	buffer = require('gulp-buffer'),
	glob = require('glob'),
	mocha = require('gulp-mocha'),
	brfs = require('brfs'),
	source = require('vinyl-source-stream');

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: './dist'
        },
		startPath: 'index.html'
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

gulp.task('test-bundle', ['lint'], function(){
	var testBundler = browserify({debug: true});

	glob.sync('./tests/**/*.js').forEach(function(file){
		testBundler.add(file);
	});

	return testBundler.transform(brfs)
		.bundle()
		.pipe(source('test.js'))
		.pipe(gulp.dest('dist/scripts'))
});

var testFiles = [
	'dist/scripts/test.js',
];
gulp.task('karma', ['test-bundle'], function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('karma-watch', ['test-bundle'], function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('mocha', function(){
	gulp.src('./tests/**/*.js')
		.pipe(mocha());
});
gulp.task('lint', function() {
  return gulp.src('src/scripts/**/*')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('scripts', ['lint'], function() {
	var srcBundler = browserify('./src/scripts/main.js', {debug: false});

	srcBundler.transform(brfs);
  return srcBundler.bundle()
	.pipe(source('main.js'))
	.pipe(buffer())
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


gulp.task('watch', ['default','browser-sync','karma-watch'], function() {
	gulp.watch('src/images/**/*', ['images']);
	gulp.watch('src/scripts/**/*.js', {debounceDelay: 2000}, ['scripts', 'test-bundle']);
	gulp.watch('tests/**/*.js', {debounceDelay: 2000}, ['test-bundle']);
	gulp.watch('src/styles/**/*.scss', {debounceDelay: 2000}, ['styles']);

});
