// TODO: webpack preset env

var gulp = require("gulp");
var gutil = require("gulp-util");
var del = require("del");
var runSequence = require("run-sequence");
var webpack = require("webpack");
var sass = require("gulp-sass")

gulp.task("webpack", function (callback) {
    webpack(require("./webpack.config"), function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        callback();
    });
});

gulp.task("clean_chromium", function () {
    return del(["dist/chromium"]);
});

gulp.task("copy_chromium_files", function () {
    return gulp.src([
        "src/**/*.{bundle.js,png,css}",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

gulp.task("make_chrome", function (callback) {
    runSequence("webpack", "clean_chromium", "copy_chromium_files", callback);
});

gulp.task("sass", function () {
    return gulp.src("src/assets/sass/**/*.sass")
        .pipe(sass())
        .pipe(gulp.dest("src/assets/css"));
});

// The default gulp task that runs when we
// just type `gulp`
gulp.task("default", function (callback) {
    runSequence("sass", "make_chrome", callback);
})
