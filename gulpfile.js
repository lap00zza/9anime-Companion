/**
 *  MIT License
 *
 *  Copyright (c) 2017 Jewel Mahanta
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

var del = require("del");
var path = require("path");
var gulp = require("gulp");
var zip = require("gulp-zip");
var sass = require("gulp-sass");
var gutil = require("gulp-util");
var webpack = require("webpack");
var Server = require("karma").Server;
var runSequence = require("run-sequence");
var childProcess = require("child_process");

/**********************************************************************************************************************/
gulp.task("clean_bundles", function () {
    return del(["src/assets/js/*.bundle.js"]);
});

gulp.task("webpack", function (callback) {
    // run webpack
    // noinspection JSUnresolvedFunction
    webpack({
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: path.resolve(__dirname, "src/assets/lib/jquery-3.2.0.min.js"),
                $: path.resolve(__dirname, "src/assets/lib/jquery-3.2.0.min.js"),
                jquery: path.resolve(__dirname, "src/assets/lib/jquery-3.2.0.min.js")
            })
        ],
        entry: {
            background: "./src/assets/js/events.js",
            content_watch_page: "./src/assets/js/content_watch_page.js",
            content_global: "./src/assets/js/content_global.js",
            popup: "./src/assets/js/main.js",
            options: "./src/assets/js/optionsPage.js"
        },
        output: {
            filename: "[name].bundle.js",
            path: path.resolve(__dirname, "src/assets/js")
        }
    }, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        callback();
    });
});

/**********************************************************************************************************************/
// We start off by deleting the current directory
// so that we are not left with any stale files.
gulp.task("clean_chrome", function () {
    return del(["dist/chromium"]);
});

// Then we copy the common files from the src directory
// and the chromium specific files from the platform
// directory to the dist/chromium directory.
gulp.task("copy_chromium_files", function () {
    return gulp.src([
        "src/**/*.{bundle.js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

gulp.task("make_chrome", function (callback) {
    runSequence("clean_chrome", "webpack", "copy_chromium_files", "clean_bundles", callback);
});

// This is a helper task to make zip archives of the
// extensions. Helpful for easy distribution.
gulp.task("zip_chrome", ["make_chrome"], function () {
    gulp.src([
        "dist/chromium/**/*"
    ])
        .pipe(zip("9anime_Companion_chrome.zip"))
        .pipe(gulp.dest("dist"));
});

/**********************************************************************************************************************/
gulp.task("clean_firefox", function () {
    return del(["dist/firefox"]);
});

gulp.task("copy_firefox_files", function () {
    return gulp.src([
        "src/**/*.{bundle.js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/firefox/**/*"
    ])
        .pipe(gulp.dest("dist/firefox"));
});

gulp.task("make_firefox", function (callback) {
    runSequence("clean_firefox", "webpack", "copy_firefox_files", "clean_bundles", callback);
});

gulp.task("zip_firefox", ["make_firefox"], function () {
    gulp.src([
        "dist/firefox/**/*"
    ])
        .pipe(zip("9anime_Companion_firefox.zip"))
        .pipe(gulp.dest("dist"));
});


/**********************************************************************************************************************/
// Run test once and exit
gulp.task("test", function (done) {
    new Server({
        configFile: path.resolve(__dirname, "test/karma.conf.js"),
        singleRun: true
    }, done).start();
});

/**********************************************************************************************************************/
gulp.task("linter", function (done) {
    var esPath = path.resolve(__dirname, "node_modules/eslint/bin/eslint.js");
    var eslintrcPath = path.resolve(__dirname, ".eslintrc.json");
    var esProcess = childProcess.fork(esPath, [
        "-c", 
        eslintrcPath, 
        "./src/assets/js", 
        "./test", 
        "./platform", 
        "gulpfile.js"
    ]);

    esProcess.on("exit", function (exitCode) {
        // if its not a clean exit we call the done
        // callback with the error code.
        if (exitCode !== 0) {
            done(exitCode);
            return;
        }
        // If no error, we move on with our lives.
        done();
    });
});

// Compile sass to regular css
gulp.task("sass", function () {
    return gulp.src("src/assets/sass/*.sass")
        .pipe(sass())
        .pipe(gulp.dest("src/assets/css"));
});

// This default task is added so that we can easily
// test our entire process using travis.
gulp.task("default", function () {
    runSequence("sass", "linter", "test", "make_chrome", "make_firefox", "zip_chrome", "zip_firefox");
});
