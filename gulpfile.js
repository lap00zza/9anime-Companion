// TODO: webpack preset env

let fs = require('fs');
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
const version = JSON.parse(fs.readFileSync("package.json")).version;

let isAppveyor = false;
if ("APPVEYOR" in process.env && process.env.APPVEYOR === "True") {
    isAppveyor = true;
}

/* --- Common Tasks --- */
gulp.task("clean_dist", function () {
    return del(["dist/**/*"]);
});

gulp.task("copy_vendor_files", function () {
    return gulp.src([
        // "node_modules/axios/dist/axios.js",
        "node_modules/bootstrap/dist/js/bootstrap.js",
        "node_modules/jquery/dist/jquery.js",
        "node_modules/popper.js/dist/umd/popper.js",
        "node_modules/toastr/toastr.js",
    ])
        .pipe(gulp.dest("src/vendor"));
});

gulp.task("sass", function () {
    return gulp.src("src/sass/**/*.sass")
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
gulp.task("copy_chromium_files", ["copy_vendor_files"], function () {
    return gulp.src([
        "!src/templates/**.*",
        "src/**/*.{js,bundle.js,png,css,svg,html,jpg}",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

// zips up the files in dist/chromium, which means
// this should be called once there is some files
// inside dist/chromium, i.e. towards the end of
// the default task.
gulp.task("zip_chrome", function () {
    let fileName = `9anime_Companion-chrome-${version}.zip`;
    if (isAppveyor) {
        fileName = `9anime_Companion-chrome-${version}.${process.env.APPVEYOR_BUILD_NUMBER}.zip`;
    }
    gulp.src("dist/chromium/**/*", {nodir: true})
        .pipe(zip(fileName))
        .pipe(gulp.dest("dist"));
});

/* --- Firefox Related Tasks --- */
gulp.task("copy_firefox_files", ["copy_vendor_files"], function () {
    return gulp.src([
        "!src/templates/**.*",
        "src/**/*.{js,bundle.js,png,css,svg,html,jpg}",
        "platform/firefox/**/*"
    ])
        .pipe(gulp.dest("dist/firefox"));
});

gulp.task("zip_firefox", function () {
    let fileName = `9anime_Companion-firefox-${version}.zip`;
    if (isAppveyor) {
        fileName = `9anime_Companion-firefox-${version}.${process.env.APPVEYOR_BUILD_NUMBER}.zip`;
    }
    gulp.src("dist/firefox/**/*", {nodir: true})
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
        .pipe(gulp.dest("dist/chromium"))
        .pipe(gulp.dest("dist/firefox"));
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
        "copy_firefox_files",
        "zip_firefox",
        callback
    );
});
