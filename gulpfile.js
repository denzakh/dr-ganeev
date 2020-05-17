"use strict";

const FRONT_PATH = "./app/frontend/";
const BUILD_PATH = "./app/build/";

const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const gutil = require("gulp-util");
const babel = require("gulp-babel");
const babelify = require("babelify");

const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const path = require("path");
const cssnano = require("cssnano");
const concat = require("gulp-concat");

const imagemin   = require("gulp-imagemin");
const imageminJpegoptim = require("imagemin-jpegoptim");

const rename = require('gulp-rename');
const realFavicon = require ('gulp-real-favicon');

const fs = require('fs');


function js(cb) {
	return browserify(FRONT_PATH+"js/app.js", { debug: true })
		.transform(babelify.configure(
			{
				presets: ["@babel/preset-env"] ,
				compact: true
			}
		))
		.bundle()
		.pipe(source("app.js"))
		.pipe(rename("script.min.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(BUILD_PATH+"js"));
}


function css(cb) {
	return 	gulp.src([FRONT_PATH+"less/style.less"])
		.pipe(less({
			paths: [ path.join(__dirname, "less", "includes") ]
		}))
		.pipe(postcss([
			autoprefixer,cssnano({safe:true})
		]))
		.pipe(sourcemaps.init())
		.pipe(concat("style.min.css"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(BUILD_PATH+"css"));
}


function img(cb) {
	return gulp.src(FRONT_PATH+"**/*.{jpg,gif,png,jpeg,svg,ico}")
		.pipe(
			imagemin([
				imagemin.gifsicle(),
				imagemin.jpegtran({
					progressive: true
				}),
				imagemin.optipng({
					optimizationLevel: 7
				}),
				imagemin.svgo(),
				imageminJpegoptim({max: 85})
			], {
			verbose: true
		}))
		.pipe(gulp.dest(BUILD_PATH));
}


// отслеживаем изменения в проекте
function watch(cb) {
	gulp.watch(FRONT_PATH+'less/**/*.less', gulp.series(css) );
	gulp.watch(FRONT_PATH+'js/**/*.js', gulp.series(js) );
	console.log('Running watch...');
}

// КОМАНДЫ ЗАПУСКА
exports.ss = gulp.parallel(js, css);
exports.default = gulp.series(gulp.parallel(css, js), watch);
exports.build = gulp.series(gulp.parallel(css, js, img));




// ВСПОМОГАТЕЛЬНЫЕ ЗАДАЧИ


// создание фавиконов
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Замените TODO: Path to your master picture на путь до вашего исходника
// из которой будут генерироваться иконки.
// Например, assets/images/master_picture.png

// Замените TODO: Path to the directory where to store the icons
// на путь до директории где будут лежать ваши сгенерированые иконки.
// Например, dist/images/icons
// iconsPath - относительный путь до иконок от HTML, / - по умолчанию

gulp.task('generate-favicon', function(done) {
  realFavicon.generateFavicon({
	masterPicture: FRONTEND_PATH +'img/favicon.jpg',
	dest: FRONTEND_PATH +'img/favicons',
	iconsPath: BUILD_PATH + 'img/favicons/',
	design: {
	  ios: {
		pictureAspect: 'backgroundAndMargin',
		backgroundColor: '#ffffff',
		margin: '1px'
	  },
	  desktopBrowser: {},
	  windows: {
		pictureAspect: 'no_change',
		backgroundColor: '#da532c',
		onConflict: 'override'
	  },
	  androidChrome: {
		pictureAspect: 'shadow',
		themeColor: '#ffffff',
		manifest: {
		  name: 'PUGOFKA',
		  display: 'browser',
		  orientation: 'notSet',
		  onConflict: 'override'
		}
	  },
	  safariPinnedTab: {
		pictureAspect: 'silhouette',
		themeColor: '#5bbad5'
	  }
	},
	settings: {
	  compression: 5,
	  scalingAlgorithm: 'Mitchell',
	  errorOnImageTooSmall: false
	},
	markupFile: FAVICON_DATA_FILE
  }, function() {
	done();
  });
});


// Вставка в html

// // Замените TODO: List of the HTML files where to inject favicon markups
// на путь до файлов в которые будет вставлен код внедрения favicon.
// Например, ['dist/*.html', 'dist/misc/*.html']

// Замените TODO: Path to the directory where to store the HTML files
// на путь до директории, где хранятся ваши HTML файлы.
gulp.task('inject-favicon-markups', function() {
  gulp.src([ 'icons.html' ])
	.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
	.pipe(gulp.dest(''));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
  var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
	if (err) {
	  throw err;
	}
  });
});