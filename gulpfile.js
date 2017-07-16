// TODO: webpack preset env

let gulp = require("gulp");
let gutil = require("gulp-util");
let del = require("del");
let runSequence = require("run-sequence");
let webpack = require("webpack");
let sass = require("gulp-sass");

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
        "src/background.html",
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
