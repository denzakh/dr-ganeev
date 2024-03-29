"use strict";

const FRONT_PATH = "./src/";
const BUILD_PATH = "./dist/";

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

const imagemin = require("gulp-imagemin");
const imageminJpegoptim = require("imagemin-jpegoptim");

const htmlmin = require("gulp-html-minifier");
const fileInclude = require("gulp-file-include");

const rsync = require("gulp-rsync");

const rename = require("gulp-rename");
const realFavicon = require("gulp-real-favicon");

const fs = require("fs");

function js(cb) {
  return browserify(FRONT_PATH + "js/app.js", { debug: true })
    .transform(
      babelify.configure({
        presets: ["@babel/preset-env"],
        compact: true,
      })
    )
    .bundle()
    .pipe(source("app.js"))
    .pipe(rename("script.min.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(BUILD_PATH + "js"));
}

function css(cb) {
  return gulp
    .src([FRONT_PATH + "less/style.less"])
    .pipe(
      less({
        paths: [path.join(__dirname, "less", "includes")],
      })
    )
    .pipe(postcss([autoprefixer, cssnano({ safe: true })]))
    .pipe(sourcemaps.init())
    .pipe(concat("style.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(BUILD_PATH + "css"));
}

function critical(cb) {
  return gulp
    .src([FRONT_PATH + "less/critical.less"])
    .pipe(
      less({
        paths: [path.join(__dirname, "less", "includes")],
      })
    )
    .pipe(postcss([autoprefixer, cssnano({ safe: true })]))
    .pipe(concat("critical.min.css"))
    .pipe(gulp.dest(BUILD_PATH + "css"));
}

function img(cb) {
  return gulp
    .src(FRONT_PATH + "**/*.{jpg,gif,png,jpeg,svg,ico}")
    .pipe(
      imagemin(
        [
          imagemin.gifsicle(),
          imagemin.mozjpeg({
            progressive: true,
          }),
          imagemin.optipng({
            optimizationLevel: 7,
          }),
          imagemin.svgo(),
          imageminJpegoptim({ max: 85 }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest(BUILD_PATH));
}

function html(cb) {
  return (
    gulp
      .src([FRONT_PATH + "**/*.html"])
      .pipe(
        fileInclude({
          prefix: "@@",
          basepath: "@file",
        })
      )
      //.pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest(BUILD_PATH))
  );
}

function deploy(cb) {
  return gulp.src("./dist/**").pipe(
    rsync({
      options: {
        chmod: "ugo=rwX",
        r: true,
        v: true,
        delete: true,
        verbose: true,
        progress: true,
      },
      root: "dist",
      // позволяет игонорировать папку-источник
      // например, нужно скопировать все из build
      // без настройки root папка-источник build будет положена в destination
      // destination/build/js/**
      // а если корнем будет build
      // то будет destination/build/js/**
      hostname: "den-zakh@den-zakh.myjino.ru",
      destination: "/home/users/d/den-zakh/domains/dr-ganeev.ru/",
      exclude: ["**/Thumbs.db", "**/*.DS_Store"],
      recursive: true,
      archive: true,
      silent: false,
      compress: true,
    })
  );
}

// отслеживаем изменения в проекте
function watch(cb) {
  gulp.watch(FRONT_PATH + "less/**/*.less", gulp.series(css));
  gulp.watch(FRONT_PATH + "js/**/*.js", gulp.series(js));
  gulp.watch(FRONT_PATH + "**/*.html", gulp.series(html));
  console.log("Running watch...");
}

// КОМАНДЫ ЗАПУСКА
exports.default = gulp.series(gulp.parallel(css, critical, js), html, watch);
exports.build = gulp.parallel(gulp.series(critical, html), css, js, img);
exports.deploy = gulp.parallel(deploy);
