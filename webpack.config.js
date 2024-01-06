const fs = require("node:fs");
const path = require("node:path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const package = require("./package.json");

const pages = fs.readdirSync(path.join(process.cwd(), "pages"), "utf8")
    .filter(file => path.extname(file) === ".jsx")
    .map(file => path.basename(file, ".jsx"));

module.exports = {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.join(__dirname, "index.jsx"),
    output: {
        path: path.join(__dirname, "www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        // chunkFilename: "[name].[contenthash].chunk.js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: "all",
    //     },
    // },
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
                    __dirname,
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
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
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
        new MiniCssExtractPlugin({
            filename: "[contenthash].css",
            chunkFilename: "[id].css",
        }),
        new webpack.DefinePlugin({
            "process.env.PATH_PREFIX": JSON.stringify(process.env.PATH_PREFIX || "/"),
            "process.env.VERSION": JSON.stringify(package.version),
            "process.env.URL_REPOSITORY": JSON.stringify(package.repository),
            "process.env.URL_ISSUES": JSON.stringify(package.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(package.homepage),
        }),
        ...pages.map(page => {
            return new HtmlWebpackPlugin({
                template: path.join(__dirname, "index.html"),
                filename: `${page}.html`,
                minify: true,
            });
        }),
    ],
};
