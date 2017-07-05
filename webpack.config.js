var path = require("path");
var fs = require("fs");
var webpack = require("webpack");

module.exports = {
    entry: {
        cs_watch_page: "./src/cs_watch_page.js",
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "src/build")
    },
    plugins: [
        //  https://webpack.js.org/plugins/banner-plugin/#options
        new webpack.BannerPlugin({
            banner: fs.readFileSync('./LICENSE', {encoding: 'UTF-8'}),
            entryOnly: true
        })
    ]
};
