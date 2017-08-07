let path = require("path");
let fs = require("fs");
let webpack = require("webpack");

module.exports = {
    cache: true,
    entry: {
        background: "./src/background.ts",
        content_script_global: "./src/content_script_global.ts",
        content_script_watchpage: "./src/content_script_watchpage.ts",
        dashboard: "./src/dashboard.ts",
        popup: "./src/popup.ts",
        vendor: ["jquery"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                loader: "ts-loader"
            }
        ]
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "src/build/js")
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            // We need the vendor bundle for only 3 entrypoints.
            chunks: ["cs_watch_page", "dashboard", "popup"],
            filename: "vendor.bundle.js",
            // `Infinity` just creates the commons chunk, but moves
            // no modules into vendor.bundle.js
            minChunks: Infinity,
            name: "vendor"
        }),
        new webpack.BannerPlugin({
            banner: fs.readFileSync("./LICENSE", {encoding: "UTF-8"}),
            entryOnly: true
        }),
        // Need to provide jQuery and Tether for bootstrap to run !!!
        new webpack.ProvidePlugin({
            jQuery: path.resolve(__dirname, "node_modules/jquery/dist/jquery.js"),
            Tether: path.resolve(__dirname, "node_modules/tether/dist/js/tether.js"),
        })
    ],
    resolve: {
        // Add .ts and .js as resolvable extensions.
        extensions: [".ts", ".js"]
    }
};
