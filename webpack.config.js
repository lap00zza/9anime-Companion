let path = require("path");

module.exports = {
    cache: true,
    entry: {
        background: "./src/ts/background.ts",
        cscript_global: "./src/ts/cscript_global.ts",
        cscript_global_pre: "./src/ts/cscript_global_pre.ts",
        cscript_watchpage: "./src/ts/cscript_watchpage.ts",
        dashboard: "./src/ts/dashboard.ts",
        popup: "./src/ts/popup.ts"
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
    resolve: {
        // Add .ts and .js as resolvable extensions.
        extensions: [".ts", ".js"]
    }
};
