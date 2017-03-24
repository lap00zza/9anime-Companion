var gulp = require("gulp");
var zip = require("gulp-zip");


gulp.task("make_chrome", function () {
    gulp.src([
        "src/**/*",
        "platform/chromium/**/*"
    ])
        .pipe(gulp.dest("dist/chromium"));
});

gulp.task("dist_chrome", function () {
    gulp.src([
        "src/**/*",
        "platform/chromium/**/*"
    ])
        .pipe(zip("9anime_Companion_chrome.zip"))
        .pipe(gulp.dest("dist"));
});

gulp.task("make_firefox", function () {
    gulp.src([
        "src/**/*",
        "platform/firefox/**/*"
    ])
        .pipe(gulp.dest("dist/firefox"));
});

gulp.task("dist_firefox", function () {
    gulp.src([
        "src/**/*",
        "platform/firefox/**/*"
    ])
        .pipe(zip("9anime_Companion_firefox.zip"))
        .pipe(gulp.dest("dist"));
});