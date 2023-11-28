const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const package = require("./package.json");


module.exports = {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: {
        app: path.join(__dirname, "index.jsx"),
        lite: path.join(__dirname, "lite.jsx"),
    },
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
                test: /\.mdx?$/,
                loader: "@mdx-js/loader",
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
            "process.env.VERSION": JSON.stringify(package.version),
            "process.env.URL_REPOSITORY": JSON.stringify(package.repository),
            "process.env.URL_ISSUES": JSON.stringify(package.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(package.homepage),
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "index.html"),
            filename: "[name].html",
            inject: false,
            minify: true,
        }),
    ],
};
