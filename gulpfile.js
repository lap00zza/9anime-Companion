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

var gulp = require("gulp");
var zip = require("gulp-zip");
var del = require("del");
var Server = require("karma").Server;
var runSequence = require("run-sequence");

// We start off by deleting the current directory
// so that we are not left with any stale files.
gulp.task("clean_chrome", function () {
    return del(["dist/chromium"]);
});

// Then we copy the common files from the src directory
// and the chromium specific files from the platform
// directory to the dist/chromium directory.
gulp.task("make_chrome", ["clean_chrome"], function () {
    gulp.src([
        "src/**/*.{js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

// This is a helper task to make zip archives of the
// extensions. Helpful for easy distribution.
gulp.task("zip_chrome", function () {
    gulp.src([
        "src/**/*.{js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/chromium/**/*"
    ])
        .pipe(zip("9anime_Companion_chrome.zip"))
        .pipe(gulp.dest("dist"));
});


gulp.task("clean_firefox", function () {
    return del(["dist/firefox"]);
});

gulp.task("make_firefox", ["clean_firefox"], function () {
    gulp.src([
        "src/**/*.{js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/firefox/**/*"
    ])
        .pipe(gulp.dest("dist/firefox"));
});

gulp.task("zip_firefox", function () {
    gulp.src([
        "src/**/*.{js,css,png,html,eot,svg,ttf,woff,woff2,LICENSE}",
        "platform/firefox/**/*"
    ])
        .pipe(zip("9anime_Companion_firefox.zip"))
        .pipe(gulp.dest("dist"));
});


/**
 * Run test once and exit
 */
gulp.task("test", function (done) {
    new Server({
        configFile: __dirname + "/test/karma.conf.js",
        singleRun: true
    }, done).start();
});

// This default task is added so that we can easily
// test our entire process using travis.
gulp.task("default", function () {
    runSequence("test", ["make_chrome", "make_firefox"]);
});