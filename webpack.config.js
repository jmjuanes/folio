const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

module.exports = {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.join(__dirname, "app", "index.jsx"),
    output: {
        path: path.join(__dirname, "www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    devServer: {
        hot: false,
        static: {
            directory: path.join(__dirname, "www"),
            staticOptions: {
                extensions: ["html"],
            },
        },
        historyApiFallback: {
            rewrites: [
                {from: /^\/$/, to: "app.html"},
                {from: /^\/index.html$/, to: "app.html"},
            ],
        },
        devMiddleware: {
            writeToDisk: true,
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.join(__dirname, "app"),
                    path.join(__dirname, "packages"),
                ],
                exclude: /(node_modules|www)/,
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
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/resource",
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(package.version),
            "process.env.URL_REPOSITORY": JSON.stringify(package.repository),
            "process.env.URL_ISSUES": JSON.stringify(package.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(package.homepage),
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.join(__dirname, "node_modules/lowcss/low.css"),
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "app", "template.html"),
            filename: "app.html",
            minify: true,
        }),
    ],
};
