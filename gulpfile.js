'use strict';

// Module Requires
var path         = require('path');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var source       = require('vinyl-source-stream');
var browserify   = require('browserify');
var jade         = require('gulp-jade');
var merge        = require('merge-stream');
var imagemin     = require('gulp-imagemin');
var jshint       = require('gulp-jshint');
var nodemon      = require('gulp-nodemon');
var sass         = require('gulp-ruby-sass');
var minifyCss    = require('gulp-minify-css');
var sourcemaps   = require('gulp-sourcemaps');
var del          = require('del');
var runSequence  = require('run-sequence');

// Gulp paths and options
var SRC_DIR    = './public';
var SERVER_DIR = './server';
var BUILD_DIR  = './dist';

var SRC_JS       = path.join(SRC_DIR, 'js');
var SRC_SASS     = path.join(SRC_DIR, 'sass');
var SRC_IMG      = path.join(SRC_DIR, 'img');
var SRC_FONTS    = path.join(SRC_DIR, 'fonts');
var SRC_PARTIALS = path.join(SRC_DIR, 'partials');

var BROWSERIFY_BUNDLES = [
	{
		debug: true,
		entries: './' + SRC_JS + '/main.js',
		dest: path.join(BUILD_DIR, 'js'),
		outputName: 'global.js',
		paths: ['./node_modules', './public/js'],
		fullPaths: true
	}
];

var SASS_OPTIONS = {
	sourcemap: true,
	quiet: true
};

// Clean up build directory
gulp.task('clean', function(cb) {
	del(BUILD_DIR, function(err) {
		if (err) { cb(err); }
		cb();
	});
});

// SASS compilation
gulp.task('styles', function() {
	return sass(SRC_SASS, SASS_OPTIONS)
		.pipe(sourcemaps.write('../maps', {
			includeContent: false,
			sourceRoot: SRC_SASS
		}))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'css')));
});

// Javscript linting
gulp.task('lint', function() {
	return gulp.src(SRC_JS)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// Javascript assets pipeline
gulp.task('scripts', function(cb) {
	var queue = BROWSERIFY_BUNDLES.length;

	function browserifyIt(config) {
		var b = browserify(config);

		function done() {
			if (--queue === 0) {
				cb();
			}
		}

		return b
			.bundle()
			.on('error', function(err) {
				console.log(err);
			})
			.pipe(source(config.outputName))
			.pipe(gulp.dest(config.dest))
			.on('end', done);
	}

	BROWSERIFY_BUNDLES.forEach(browserifyIt);
});

// Compile Jade partials
gulp.task('partials', function() {
	return gulp.src(SRC_PARTIALS+'/*.jade')
		.pipe(jade())
		.pipe(gulp.dest(path.join(BUILD_DIR, 'partials')));
});

// Images
gulp.task('images', function() {
	return gulp.src(SRC_IMG)
		.pipe(imagemin())
		.pipe(gulp.dest(path.join(BUILD_DIR, 'img')));
});

// Fonts
gulp.task('fonts', function() {
	return gulp.src(SRC_FONTS)
		.pipe(gulp.dest(path.join(BUILD_DIR, 'fonts')));
});

// Watch function
gulp.task('watch', function() {
	gulp.watch(SRC_SASS+'/*', ['styles']);
	gulp.watch(SRC_JS+'/*', ['lint', 'scripts']);
	gulp.watch(SRC_IMG+'/*', ['images']);
	gulp.watch(SRC_PARTIALS+'/*', ['partials']);
});

// Dev server
gulp.task('develop', function() {
	return nodemon({
		script: './index.js',
		ignore: ['node_modules/*', 'git', 'public/*', 'dist/*']
	})
	.on('start', ['watch'])
	.on('change', ['lint', 'watch']);
});

// Build task
gulp.task('build', function(cb) {
	runSequence(
		// clean build directory
		'clean',

		// run these in parallel
		[
			'lint',
			'scripts',
			'styles',
			'images',
			'partials'
		],
		function(err) {
			if (err) { cb(err); }
			cb();
		}
	);
});

// Default gulp task
gulp.task('default', function() {
	runSequence(
		'build',
		// start dev server
		'develop'
	);
});
