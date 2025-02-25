import fs from "node:fs";
import path from "node:path";
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
// import env from "./server/utils/environment.js";

// read package.json
const pkg = JSON.parse(fs.readFileSync("./package.json"));

// const CLIENTS = {
//     LOCAL: path.join(__dirname, "app/clients/local.js"),
//     REMOTE: path.join(__dirname, "app/clients/remote.js"),
// };

export default {
    mode: process.env.NODE_ENV || "development", // "production",
    target: "web",
    entry: path.resolve("app/index.jsx"),
    output: {
        path: path.resolve("www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    resolve:{
        alias: {
            // "@folio/client": CLIENTS[(env?.CLIENT || "LOCAL").toUpperCase()],
            "@folio/client": path.resolve("app/clients/local.js"),
        },
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
            // Global values
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
            // ENV values
            // "process.env.APP": JSON.stringify(env.APP || "LITE"),
            // "process.env.CLIENT": JSON.stringify(env.CLIENT || "LOCAL"),
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.resolve("node_modules/lowcss/low.css"),
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve("app/template.html"),
            filename: "app.html",
            minify: true,
        }),
    ],
};
