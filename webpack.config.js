const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CopyPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

module.exports = {
    mode: "production",
    target: "web",
    entry: path.join(__dirname, "folio-app", "app.js"),
    output: {
        path: path.join(__dirname, "public"),
        publicPath: "./",
        filename: "[contenthash:9].js",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "folio-react"),
                    path.join(__dirname, "folio-app"),
                ],
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env", 
                        "@babel/preset-react",
                    ],
                    plugins: [
                        "@babel/plugin-transform-react-jsx",
                        "@babel/plugin-transform-runtime",
                    ],
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(package.version),
            // "process.env.HOMEPAGE_URL": JSON.stringify(package.homepage),
        }),
        // new CopyPlugin({
        //     patterns: [
        //         path.join(__dirname, "styles.css"),
        //     ],
        // }),
        new HtmlWebpackPlugin({
            title: "Folio App",
            template: path.join(__dirname, "folio-app/index.html"),
            meta: {
                "viewport": "width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no",
            },
        }),
    ],
};
