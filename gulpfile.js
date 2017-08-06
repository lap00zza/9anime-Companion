// TODO: webpack preset env

let fs = require('fs')
let gulp = require("gulp");
let gutil = require("gulp-util");
let del = require("del");
let runSequence = require("run-sequence");
let webpack = require("webpack");
let sass = require("gulp-sass");
let zip = require("gulp-zip");

// For the version, we will just read from package.json.
// Version format is in Major Minor Patch. While building
// in Appveyor, we will append the Build number to it.
const version = JSON.parse(fs.readFileSync("package.json")).version

let isAppveyor = false;
if ("APPVEYOR" in process.env && process.env.APPVEYOR === "True") {
    isAppveyor = true;
}

/* --- Common Tasks --- */
gulp.task("clean_dist", function () {
    return del(["dist/**/*"]);
});

gulp.task("sass", function () {
    return gulp.src("src/assets/sass/**/*.sass")
        .pipe(sass())
        .pipe(gulp.dest("src/build/css"));
});

gulp.task("webpack", function (callback) {
    webpack(require("./webpack.config"), function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        callback();
    });
});

/* --- Chrome Related Tasks --- */
gulp.task("copy_chromium_files", function () {
    return gulp.src([
        "!src/templates/**.*",
        "src/**/*.{bundle.js,png,css,svg,html,jpg}",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

// zips up the files in dist/chromium, which means
// this should be called once there is some files
// inside dist/chromium, i.e. towards the end of
// the default task.
gulp.task("zip_chrome", function () {
    let fileName = `9anime_Companion-chrome-${version}.zip`
    if (isAppveyor) {
        fileName = `9anime_Companion-chrome-${version}.${process.env.APPVEYOR_BUILD_NUMBER}.zip`;
    }
    gulp.src("dist/chromium/**/*", {nodir: true})
        .pipe(zip(fileName))
        .pipe(gulp.dest("dist"));
});

/* --- Utility Tasks --- */
gulp.task("quick:html_and_sass", ["sass"], function () {
    return gulp.src([
        "!src/templates/**.*",
        "src/**/*.html",
        "src/**/*.css",
    ])
        .pipe(gulp.dest("dist/chromium"));
});

/* --- DEFAULT TASK --- */
// The default gulp task that runs when we
// just type `gulp`
gulp.task("default", function (callback) {
    runSequence(
        "clean_dist",
        "webpack",
        "sass",
        "copy_chromium_files",
        "zip_chrome",
        callback
    );
})
