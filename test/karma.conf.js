var path = require("path");
var webpack = require("webpack");

module.exports = function (config) {
    var options = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "..",


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        // TODO: optimize this for webpack
        files: [
            "test/mocks.js",
            "src/assets/js/animeUtils.js",
            "src/assets/js/download_all.js",
            "test/unit/**.*"
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "src/assets/js/animeUtils.js": ["webpack"],
            "src/assets/js/download_all.js": ["webpack"],
            "test/unit/*.spec.js": ["webpack"]
        },

        webpack: {
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["env"]
                            }
                        }
                    }
                ]
            }
        },

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        },

        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress"],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ["Chrome"],

        // Custom Chrome Launcher for Travis as we need
        // to run chrome using the --no-sandbox flag
        customLaunchers: {
            Chrome_travis_ci: {
                base: "Chrome",
                flags: ["--no-sandbox"]
            }
        },


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    };

    if (process.env.TRAVIS) {
        // While running under travis, we replace chrome with
        // Chrome_travis_ci and continue business as usual.
        options.browsers = ["Chrome_travis_ci"];
    }
    config.set(options);
};
