import { resolve } from "node:path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { createServer } from "./scripts/webpack-server.js";
import authenticationRules from "./scripts/__stubs/authentication.js";
import storageRules from "./scripts/__stubs/storage.js";
import pkg from "./package.json" with {type: "json"};

export default {
    mode: process.env.NODE_ENV || "development",
    target: "web",
    entry: resolve("app.tsx"),
    // entry: {
    //     "folio-react": {
    //         import: path.resolve("folio-react/index.jsx"),
    //         filename: "folio-react/folio.js",
    //         layer: "folio-react",
    //     },
    // },
    output: {
        path: resolve("www"),
        publicPath: "./",
        filename: "[name].[contenthash].js",
        chunkFilename: "[name].[contenthash].chunk.js",
    },
    // output: {
    //     path: path.resolve("."),
    //     publicPath: "./",
    //     clean: false,
    //     library: {
    //         type: "module",
    //     },
    // },
    resolve: {
        alias: {
            "folio-react": resolve("./folio-react/"),
            "@profile": resolve("./profiles/development.ts"),
        },
        extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
        splitChunks: {
            chunks: "all",
        },
    },
    // experiments: {
    //     layers: true,
    //     outputModule: true,
    // },
    // externals: {
    //     byLayer: {
    //         "folio-react": {
    //             "react": "react",
    //             "react-dom": "react-dom",
    //             "react-dom/server": "react-dom/server",
    //         },
    //     },
    // },
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
            ],
        },
        setupMiddlewares: createServer([
            ...authenticationRules,
            ...storageRules,
        ]),
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
                    resolve("./folio-react"),
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
                        // path.resolve("scripts/babel-plugin-obfuscate-classnames.js"),
                    ],
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                type: "asset/inline",
            },
            // {
            //     test: /\.css$/,
            //     use: [
            //         "style-loader",
            //         {
            //             loader: "css-loader",
            //             options: {
            //                 modules: {
            //                     localIdentName: "[name]__[local]___[hash:base64:5]",
            //                 },
            //             },
            //         },
            //     ],
            // },
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
                {
                    from: resolve("./node_modules/lowcss/low.css"),
                    to: "low.css",
                },
                {
                    from: resolve("./resources/favicon-32x32.png"),
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
