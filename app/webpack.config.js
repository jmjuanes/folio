import { resolve, join } from "node:path";
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { createServer } from "../scripts/webpack-server.js";

import pkg from "../package.json" with { type: "json" };
// import rules from "./__stubs/rules.json" with { type: "json" };

export default {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: resolve("index.tsx"),
    output: {
        path: resolve("www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
    },
    resolve: {
        alias: {
            "folio-react": resolve("../folio-react/"),
            "@profile": resolve("./profiles/development.ts"),
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
            directory: resolve("www"),
            staticOptions: {
                extensions: ["html"],
            },
        },
        historyApiFallback: {
            rewrites: [
                { from: /^\/$/, to: "index.html" },
                // {from: /^\/index.html$/, to: "app.html"},
            ],
        },
        // setupMiddlewares: createServer(rules),
        devMiddleware: {
            writeToDisk: true,
        },
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                include: [
                    resolve("."),
                    resolve("../folio-react"),
                ],
                exclude: /(node_modules|www)/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env", 
                        [
                            "@babel/preset-react",
                            {
                                runtime: "automatic",
                            },
                        ],
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
            "process.env.VERSION": JSON.stringify(pkg.version),
            "process.env.URL_REPOSITORY": JSON.stringify(pkg.repository),
            "process.env.URL_ISSUES": JSON.stringify(pkg.bugs),
            "process.env.URL_HOMEPAGE": JSON.stringify(pkg.homepage),
            "process.env.AI_HOST": JSON.stringify(process.env.FOLIO_LITE_AI_HOST || ""),
        }),
        new CopyWebpackPlugin({
            patterns: [
                resolve("../node_modules/lowcss/low.css"),
                {
                    from: resolve("../node_modules/lowcss-helpers/index.css"),
                    to: "low.helpers.css",
                },
                {
                    from: resolve("../node_modules/lowcss-forms/index.css"),
                    to: "low.forms.css",
                },
                {
                    from: resolve("../resources/favicon-32x32.png"),
                    to: "favicon.png",
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: resolve("template.html"),
            filename: "index.html",
            minify: true,
        }),
    ],
};
