import path from "node:path";
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { createServer } from "./server.js";

import pkg from "../../package.json" with { type: "json" };

export default {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: path.resolve("index.tsx"),
    output: {
        path: path.resolve("www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
    },
    resolve: {
        alias: {
            "folio-react": path.resolve("../../folio-react/"),
            "folio-server": path.resolve("../../server/"),
        },
        extensions: [".tsx", ".ts", ".js", ".jsx"],
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
        setupMiddlewares: createServer(),
        devMiddleware: {
            writeToDisk: true,
        },
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                include: [
                    path.resolve("."),
                    path.resolve("../../folio-react"),
                ],
                exclude: /(node_modules|www)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env", 
                        "@babel/preset-react",
                        "@babel/preset-typescript",
                    ],
                    plugins: [
                        "@babel/plugin-transform-runtime",
                    ],
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
        }),
        new CopyWebpackPlugin({
            patterns: [
                path.resolve("../../node_modules/lowcss/low.css"),
                {
                    from: path.resolve("../../node_modules/lowcss-forms/index.css"),
                    to: "low.forms.css",
                },
                {
                    from: path.resolve("../../node_modules/lowcss-helpers/index.css"),
                    to: "low.helpers.css",
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve("../../index.html"),
            filename: "app.html",
            minify: true,
        }),
    ],
};
