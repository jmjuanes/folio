import path from "node:path";
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pkg from "../../package.json" with {type: "json"};

export default {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.resolve("index.jsx"),
    output: {
        path: path.resolve("www"),
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
            directory: path.resolve("www"),
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
                    path.resolve("app"),
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
            {
                test: /resources\/stickers\/([\w-]+)\.svg$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.resolve("node_modules/lowcss/low.css"),
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve("app.html"),
            filename: "app.html",
            minify: true,
        }),
    ],
};
