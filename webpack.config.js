const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

module.exports = {
    mode: "development", // "production",
    target: "web",
    entry: {
        app: path.join(__dirname, "app", "index.js"),
    },
    output: {
        path: path.join(__dirname, "public"),
        publicPath: "./",
        filename: "[contenthash:9].js",
    },
    resolve: {
        alias: {
            "folio": path.join(__dirname, "folio", "index.jsx"),
            "folio-board": path.join(__dirname, "folio", "index.jsx"),
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "app"),
                    path.join(__dirname, "folio"),
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
        new CopyPlugin({
            patterns: [
                path.join(__dirname, "node_modules", "lowcss", "dist", "low.css"),
            ],
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: [
                "app",
            ],
            template: path.join(__dirname, "app", "index.html"),
            minify: true,
        }),
    ],
};
